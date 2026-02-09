import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { Resend } from 'npm:resend@2.0.0';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

// Helper function to convert Uint8Array to Base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface IndividualTicket {
  ticket_identifier: string;
}

// The multi-line commented block containing a placeholder EventTicketProps interface and renderTicketToHtml function (with HTML/CSS)
// was removed from here to resolve TypeScript parsing errors.

// --- Environment Variables ---
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('FROM_EMAIL') || 'tickets@updates.kamayakoi.com';
const APP_BASE_URL =
  Deno.env.get('APP_BASE_URL') || 'https://www.kamayakoi.com';
const defaultLogoUrl = `${supabaseUrl}/storage/v1/object/public/assets/logo.png`;

// --- Environment Validation ---
if (!supabaseUrl || supabaseUrl.trim() === '') {
  console.error('SUPABASE_URL environment variable is missing or empty');
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === '') {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is missing or empty'
  );
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

if (!resendApiKey || resendApiKey.trim() === '') {
  console.error('RESEND_API_KEY environment variable is missing or empty');
  throw new Error('RESEND_API_KEY environment variable is required');
}

// --- Main Serve Function ---
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let purchaseIdFromRequest: string | null = null;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    const body = await req.json();
    const purchase_id = body.purchase_id;
    purchaseIdFromRequest = purchase_id;

    if (!purchaseIdFromRequest) {
      console.error('send-ticket-email: Missing purchase_id in request');
      return new Response(JSON.stringify({ error: 'Missing purchase_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- 1. Fetch Purchase, Customer, and Event Details using RPC ---
    console.log(
      `send-ticket-email: Fetching purchase data for ${purchaseIdFromRequest}`
    );
    const { data: purchaseDataArray, error: purchaseError } =
      await supabase.rpc('get_purchase_for_email_dispatch', {
        p_purchase_id: purchaseIdFromRequest,
      });

    if (purchaseError || !purchaseDataArray || purchaseDataArray.length === 0) {
      console.error(
        `send-ticket-email: Error fetching purchase ${purchaseIdFromRequest}:`,
        purchaseError
      );
      // Try to update status if we have a purchase ID
      if (purchaseIdFromRequest) {
        await supabase
          .rpc('update_email_dispatch_status', {
            p_purchase_id: purchaseIdFromRequest,
            p_email_dispatch_status: 'DISPATCH_FAILED',
            p_email_dispatch_error: `Purchase not found or DB error: ${purchaseError?.message}`,
          })
          .catch((err: unknown) =>
            console.error('Failed to update error status:', err)
          );
      }
      return new Response(
        JSON.stringify({ error: 'Purchase not found or database error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    const purchaseData = purchaseDataArray[0];

    // Check if email already sent or in progress to prevent duplicates if retried
    if (
      purchaseData.email_dispatch_status === 'SENT_SUCCESSFULLY' ||
      purchaseData.email_dispatch_status === 'DISPATCH_IN_PROGRESS'
    ) {
      console.warn(
        `send-ticket-email: Ticket email for purchase ${purchaseIdFromRequest} already processed or in progress (${purchaseData.email_dispatch_status}). Skipping.`
      );
      return new Response(
        JSON.stringify({
          message: 'Ticket email already processed or in progress.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update status to in progress using RPC
    console.log(
      `send-ticket-email: Setting purchase ${purchaseIdFromRequest} to DISPATCH_IN_PROGRESS`
    );
    const { error: updateError } = await supabase.rpc(
      'update_email_dispatch_status',
      {
        p_purchase_id: purchaseIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_IN_PROGRESS',
        p_email_dispatch_attempts:
          (purchaseData.email_dispatch_attempts || 0) + 1,
      }
    );

    if (updateError) {
      console.error(
        `send-ticket-email: Failed to update dispatch status for ${purchaseIdFromRequest}:`,
        updateError
      );
      return new Response(
        JSON.stringify({ error: 'Failed to update dispatch status' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // --- 2. Prepare Data for Ticket ---
    if (!purchaseData.customer_email || !purchaseData.customer_name) {
      console.error(
        `send-ticket-email: Customer data missing for purchase ${purchaseIdFromRequest}`
      );
      await supabase.rpc('update_email_dispatch_status', {
        p_purchase_id: purchaseIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: 'Customer data missing for purchase.',
      });
      return new Response(JSON.stringify({ error: 'Customer data missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const customerName = purchaseData.customer_name || 'Valued Customer';
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    let uniqueTicketId = purchaseData.unique_ticket_identifier;
    if (!uniqueTicketId) {
      uniqueTicketId = crypto.randomUUID();
      console.log(
        `send-ticket-email: Generated unique ticket ID ${uniqueTicketId} for purchase ${purchaseIdFromRequest}`
      );
      // Update using RPC
      await supabase.rpc('update_email_dispatch_status', {
        p_purchase_id: purchaseIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_IN_PROGRESS',
        p_unique_ticket_identifier: uniqueTicketId,
      });
    }

    // Event data for ticket
    const eventDataForTicket = {
      eventName: purchaseData.event_title || 'Amazing Event',
      eventDate: purchaseData.event_date_text || 'To Be Announced',
      eventTime: purchaseData.event_time_text || 'Soon',
      eventVenue: purchaseData.event_venue_name || 'Secret Location',
    };

    // Calculate actual ticket quantity for bundles
    const isBundle = purchaseData.is_bundle || false;
    const ticketsPerBundle = purchaseData.tickets_per_bundle || 1;
    const actualTicketQuantity = isBundle
      ? purchaseData.quantity * ticketsPerBundle
      : purchaseData.quantity;

    console.log(
      `Bundle calculation: isBundle=${isBundle}, quantity=${purchaseData.quantity}, ticketsPerBundle=${ticketsPerBundle}, actualTicketQuantity=${actualTicketQuantity}`
    );

    // --- NEW LOGIC: Decide between individual tickets or legacy single QR ---
    const INDIVIDUAL_TICKETS_CUTOFF_DATE = new Date('2025-07-01'); // Use new system for all purchases from July 1, 2025
    const purchaseDate = new Date(purchaseData.created_at || Date.now());
    const useIndividualTickets =
      purchaseDate >= INDIVIDUAL_TICKETS_CUTOFF_DATE &&
      actualTicketQuantity > 1;

    let ticketIdentifiers: string[] = [];
    const qrCodeData: Array<{ identifier: string; qrCodeBytes: Uint8Array }> =
      [];

    if (useIndividualTickets) {
      // Generate individual tickets for new multi-person purchases
      console.log(
        `Generating individual tickets for purchase ${purchaseIdFromRequest} (${actualTicketQuantity} tickets)`
      );

      const { data: generatedTickets, error: generateError } =
        await supabase.rpc('generate_individual_tickets_for_purchase', {
          p_purchase_id: purchaseIdFromRequest,
        });

      if (generateError || !generatedTickets) {
        console.error(
          `Failed to generate individual tickets for ${purchaseIdFromRequest}:`,
          generateError
        );
        await supabase.rpc('update_email_dispatch_status', {
          p_purchase_id: purchaseIdFromRequest,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `Individual ticket generation failed: ${generateError?.message}`,
        });
        return new Response(
          JSON.stringify({ error: 'Failed to generate individual tickets' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      ticketIdentifiers = (generatedTickets as IndividualTicket[]).map(
        (t: IndividualTicket) => t.ticket_identifier
      );

      // Generate QR codes for each individual ticket
      for (const ticketId of ticketIdentifiers) {
        const verificationUrl = `${APP_BASE_URL}/verify?id=${encodeURIComponent(ticketId)}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${encodeURIComponent(verificationUrl)}`;

        try {
          const qrResponse = await fetch(qrCodeUrl);
          if (!qrResponse.ok)
            throw new Error(`Failed to fetch QR code for ${ticketId}`);
          const qrCodeBytes = new Uint8Array(await qrResponse.arrayBuffer());
          qrCodeData.push({ identifier: ticketId, qrCodeBytes });
        } catch (qrError) {
          console.error(
            `Failed to generate QR for individual ticket ${ticketId}:`,
            qrError
          );
          await supabase.rpc('update_email_dispatch_status', {
            p_purchase_id: purchaseIdFromRequest,
            p_email_dispatch_status: 'DISPATCH_FAILED',
            p_email_dispatch_error: `QR generation failed for individual ticket: ${qrError}`,
          });
          return new Response(
            JSON.stringify({
              error: 'Failed to generate QR codes for individual tickets',
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } else {
      // Legacy single QR code system
      console.log(
        `Using legacy single QR system for purchase ${purchaseIdFromRequest}`
      );
      ticketIdentifiers = [uniqueTicketId];

      // --- 3. Generate QR Code Bytes (original logic) ---
      const verificationUrl = `${APP_BASE_URL}/verify?id=${encodeURIComponent(uniqueTicketId)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${encodeURIComponent(verificationUrl)}`;
      let qrCodeImageBytes: Uint8Array;
      try {
        const qrResponse = await fetch(qrCodeUrl);
        if (!qrResponse.ok)
          throw new Error(
            `Failed to fetch QR code (${qrResponse.status} from ${qrCodeUrl})`
          );
        qrCodeImageBytes = new Uint8Array(await qrResponse.arrayBuffer());
        qrCodeData.push({
          identifier: uniqueTicketId,
          qrCodeBytes: qrCodeImageBytes,
        });
      } catch (qrError) {
        console.error(
          `Failed to generate QR for ${purchaseIdFromRequest}:`,
          qrError
        );
        const errorMessage =
          qrError instanceof Error
            ? qrError.message
            : 'Unknown QR generation error';
        await supabase.rpc('update_email_dispatch_status', {
          p_purchase_id: purchaseIdFromRequest,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `QR generation error: ${errorMessage}`,
        });
        return new Response(
          JSON.stringify({
            error: 'Failed to generate QR code',
            details: errorMessage,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // // Helper functions for quantity-based text (inspired by ticket.tsx)
    // const getAdmissionText = (quantity: number) => {
    //   if (quantity === 1) return "MAXIMUM UN";
    //   if (quantity === 2) return "MAXIMUM DEUX";
    //   if (quantity === 3) return "MAXIMUM TROIS";
    //   return `MAXIMUM ${quantity}`;
    // };

    const getNameText = (
      firstName: string,
      lastName: string,
      quantity: number
    ) => {
      if (quantity === 1) return `${firstName} ${lastName}`;
      if (quantity === 2) return `${firstName} ${lastName} + Friend`;
      return `${firstName} ${lastName} + Friends`;
    };

    const ticketProps = {
      firstName: firstName,
      lastName: lastName,
      email: purchaseData.customer_email,
      phone: purchaseData.customer_phone || undefined,
      eventName: eventDataForTicket.eventName,
      eventDate: eventDataForTicket.eventDate,
      eventTime: eventDataForTicket.eventTime,
      eventVenue: eventDataForTicket.eventVenue,
      quantity: actualTicketQuantity, // Use actual ticket quantity for display
      ticketIdentifier: ticketIdentifiers[0], // Primary identifier for compatibility
      isBundle: isBundle,
      bundleQuantity: isBundle ? purchaseData.quantity : undefined, // Original bundle quantity
      useIndividualTickets: useIndividualTickets,
      ticketIdentifiers: ticketIdentifiers, // All ticket identifiers
    };

    // --- 4. Generate Clean, Simple PDF with pdf-lib ---
    const pdfsToAttach: Array<{ filename: string; content: string }> = [];

    if (useIndividualTickets) {
      // Generate individual PDFs for each ticket
      for (let i = 0; i < qrCodeData.length; i++) {
        const qr = qrCodeData[i];
        const pdfDoc = await PDFDocument.create();

        // Create smaller receipt-like page (thermal printer size)
        const receiptWidth = 250; // Narrower like a receipt
        const receiptHeight = 400; // Compact height
        const page = pdfDoc.addPage([receiptWidth, receiptHeight]);

        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(
          StandardFonts.HelveticaBold
        );

        // Receipt color scheme - white background, black text
        const blackColor = rgb(0, 0, 0);
        const whiteColor = rgb(1, 1, 1);
        const greyColor = rgb(0.5, 0.5, 0.5);

        // White background (default, but explicit)
        page.drawRectangle({
          x: 0,
          y: 0,
          width: receiptWidth,
          height: receiptHeight,
          color: whiteColor,
        });

        // Add subtle border
        page.drawRectangle({
          x: 2,
          y: 2,
          width: receiptWidth - 4,
          height: receiptHeight - 4,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
        });

        // Start from top with company header
        let y = receiptHeight - 20;

        // Company header - left aligned
        page.drawText('KAMAYAKOI', {
          x: 10,
          y: y,
          size: 10,
          font: helveticaBold,
          color: blackColor,
        });
        y -= 15;

        page.drawText('VOTRE BILLET', {
          x: 10,
          y: y,
          size: 8,
          font: helvetica,
          color: greyColor,
        });
        y -= 25;

        // Divider line
        page.drawLine({
          start: { x: 10, y: y },
          end: { x: receiptWidth - 10, y: y },
          thickness: 0.5,
          color: greyColor,
        });
        y -= 15;

        // Event details in receipt style - labels left, values right aligned
        const rightAlignX = receiptWidth - 10; // Right edge minus padding

        page.drawText('ÉVÉNEMENT', {
          x: 10,
          y: y,
          size: 7,
          font: helveticaBold,
          color: blackColor,
        });
        const eventNameWidth = helvetica.widthOfTextAtSize(
          ticketProps.eventName,
          7
        );
        page.drawText(ticketProps.eventName, {
          x: rightAlignX - eventNameWidth,
          y: y,
          size: 7,
          font: helvetica,
          color: blackColor,
        });
        y -= 12;

        page.drawText('DATE', {
          x: 10,
          y: y,
          size: 7,
          font: helveticaBold,
          color: blackColor,
        });
        const dateWidth = helvetica.widthOfTextAtSize(ticketProps.eventDate, 7);
        page.drawText(`${ticketProps.eventDate}`, {
          x: rightAlignX - dateWidth,
          y: y,
          size: 7,
          font: helvetica,
          color: blackColor,
        });
        y -= 12;

        page.drawText('HEURE', {
          x: 10,
          y: y,
          size: 7,
          font: helveticaBold,
          color: blackColor,
        });
        const timeWidth = helvetica.widthOfTextAtSize(ticketProps.eventTime, 7);
        page.drawText(`${ticketProps.eventTime}`, {
          x: rightAlignX - timeWidth,
          y: y,
          size: 7,
          font: helvetica,
          color: blackColor,
        });
        y -= 12;

        page.drawText('LIEU', {
          x: 10,
          y: y,
          size: 7,
          font: helveticaBold,
          color: blackColor,
        });
        const venueWidth = helvetica.widthOfTextAtSize(
          ticketProps.eventVenue,
          7
        );
        page.drawText(ticketProps.eventVenue, {
          x: rightAlignX - venueWidth,
          y: y,
          size: 7,
          font: helvetica,
          color: blackColor,
        });
        y -= 12;

        page.drawText('TITULAIRE', {
          x: 10,
          y: y,
          size: 7,
          font: helveticaBold,
          color: blackColor,
        });
        const holderName = `${ticketProps.firstName} ${ticketProps.lastName}`;
        const holderWidth = helvetica.widthOfTextAtSize(holderName, 7);
        page.drawText(holderName, {
          x: rightAlignX - holderWidth,
          y: y,
          size: 7,
          font: helvetica,
          color: blackColor,
        });
        y -= 20;

        // Another divider
        page.drawLine({
          start: { x: 10, y: y },
          end: { x: receiptWidth - 10, y: y },
          thickness: 0.5,
          color: greyColor,
        });
        y -= 15;

        // QR Code (bigger with proper spacing)
        try {
          const qrImage = await pdfDoc.embedPng(qr.qrCodeBytes);
          const qrSize = 100; // Bigger QR code
          const qrX = (receiptWidth - qrSize) / 2;
          const qrY = y - qrSize;
          const qrPadding = 8; // Space between border and QR code

          // Draw QR border with padding
          page.drawRectangle({
            x: qrX - qrPadding,
            y: qrY - qrPadding,
            width: qrSize + qrPadding * 2,
            height: qrSize + qrPadding * 2,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          page.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });

          y = qrY - 10;
        } catch (imgError) {
          const embedErrorMsg =
            imgError instanceof Error
              ? imgError.message
              : 'Unknown QR image embedding error';
          console.error(
            `Error embedding QR for ticket ${i + 1}:`,
            embedErrorMsg
          );

          const errorText = '[QR CODE INDISPONIBLE]';
          page.drawText(errorText, {
            x: (receiptWidth - 90) / 2,
            y: y - 15,
            size: 6,
            font: helvetica,
            color: rgb(0.8, 0.2, 0.2),
          });
          y -= 25;
        }

        // Footer messages at bottom right
        const bottomY = 25; // Very bottom of page

        const footerMsg1 = "Présentez ce QR code à l'entrée";
        const footerMsg1Width = helvetica.widthOfTextAtSize(footerMsg1, 5);
        page.drawText(footerMsg1, {
          x: rightAlignX - footerMsg1Width,
          y: bottomY,
          size: 5,
          font: helvetica,
          color: greyColor,
        });

        const footerMsg2 = 'Thank you for choosing Kamayakoi!';
        const footerMsg2Width = helvetica.widthOfTextAtSize(footerMsg2, 5);
        page.drawText(footerMsg2, {
          x: rightAlignX - footerMsg2Width,
          y: bottomY - 8,
          size: 5,
          font: helvetica,
          color: greyColor,
        });

        const individualPdfBytes = await pdfDoc.save();
        pdfsToAttach.push({
          filename: `Ticket-${i + 1}-${qr.identifier.substring(0, 8)}.pdf`,
          content: uint8ArrayToBase64(individualPdfBytes),
        });
      }
    } else {
      // Legacy single PDF generation (receipt style)
      const pdfDoc = await PDFDocument.create();

      // Create receipt-like page
      const receiptWidth = 250;
      const receiptHeight = 450; // Slightly taller for legacy with potentially more content
      const page = pdfDoc.addPage([receiptWidth, receiptHeight]);

      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Receipt color scheme - white background, black text
      const blackColor = rgb(0, 0, 0);
      const whiteColor = rgb(1, 1, 1);
      const greyColor = rgb(0.5, 0.5, 0.5);

      // White background
      page.drawRectangle({
        x: 0,
        y: 0,
        width: receiptWidth,
        height: receiptHeight,
        color: whiteColor,
      });

      // Add subtle border
      page.drawRectangle({
        x: 2,
        y: 2,
        width: receiptWidth - 4,
        height: receiptHeight - 4,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      });

      // Start from top with company header
      let y = receiptHeight - 20;

      // Company header - left aligned
      page.drawText('KAMAYAKOI', {
        x: 10,
        y: y,
        size: 10,
        font: helveticaBold,
        color: blackColor,
      });
      y -= 15;

      page.drawText('VOTRE BILLET', {
        x: 10,
        y: y,
        size: 8,
        font: helvetica,
        color: greyColor,
      });
      y -= 25;

      // Divider line
      page.drawLine({
        start: { x: 10, y: y },
        end: { x: receiptWidth - 10, y: y },
        thickness: 0.5,
        color: greyColor,
      });
      y -= 15;

      // Event details in receipt style - labels left, values right aligned
      const legacyRightAlignX = receiptWidth - 10; // Right edge minus padding

      page.drawText('ÉVÉNEMENT', {
        x: 10,
        y: y,
        size: 7,
        font: helveticaBold,
        color: blackColor,
      });
      const legacyEventNameWidth = helvetica.widthOfTextAtSize(
        ticketProps.eventName,
        7
      );
      page.drawText(ticketProps.eventName, {
        x: legacyRightAlignX - legacyEventNameWidth,
        y: y,
        size: 7,
        font: helvetica,
        color: blackColor,
      });
      y -= 12;

      page.drawText('DATE', {
        x: 10,
        y: y,
        size: 7,
        font: helveticaBold,
        color: blackColor,
      });
      const legacyDateWidth = helvetica.widthOfTextAtSize(
        ticketProps.eventDate,
        7
      );
      page.drawText(`${ticketProps.eventDate}`, {
        x: legacyRightAlignX - legacyDateWidth,
        y: y,
        size: 7,
        font: helvetica,
        color: blackColor,
      });
      y -= 12;

      page.drawText('HEURE', {
        x: 10,
        y: y,
        size: 7,
        font: helveticaBold,
        color: blackColor,
      });
      const legacyTimeWidth = helvetica.widthOfTextAtSize(
        ticketProps.eventTime,
        7
      );
      page.drawText(`${ticketProps.eventTime}`, {
        x: legacyRightAlignX - legacyTimeWidth,
        y: y,
        size: 7,
        font: helvetica,
        color: blackColor,
      });
      y -= 12;

      page.drawText('LIEU', {
        x: 10,
        y: y,
        size: 7,
        font: helveticaBold,
        color: blackColor,
      });
      const legacyVenueWidth = helvetica.widthOfTextAtSize(
        ticketProps.eventVenue,
        7
      );
      page.drawText(ticketProps.eventVenue, {
        x: legacyRightAlignX - legacyVenueWidth,
        y: y,
        size: 7,
        font: helvetica,
        color: blackColor,
      });
      y -= 12;

      page.drawText('TITULAIRE', {
        x: 10,
        y: y,
        size: 7,
        font: helveticaBold,
        color: blackColor,
      });
      const legacyDisplayName = getNameText(
        ticketProps.firstName,
        ticketProps.lastName,
        ticketProps.quantity
      );
      const legacyHolderWidth = helvetica.widthOfTextAtSize(
        legacyDisplayName,
        7
      );
      page.drawText(legacyDisplayName, {
        x: legacyRightAlignX - legacyHolderWidth,
        y: y,
        size: 7,
        font: helvetica,
        color: blackColor,
      });
      y -= 12;

      y -= 20;

      // Another divider
      page.drawLine({
        start: { x: 10, y: y },
        end: { x: receiptWidth - 10, y: y },
        thickness: 0.5,
        color: greyColor,
      });
      y -= 15;

      // QR Code (bigger with proper spacing)
      if (qrCodeData.length > 0) {
        const qr = qrCodeData[0]; // Use first (and only) QR code for legacy
        try {
          const qrImage = await pdfDoc.embedPng(qr.qrCodeBytes);
          const qrSize = 100; // Bigger QR code
          const qrX = (receiptWidth - qrSize) / 2;
          const qrY = y - qrSize;
          const qrPadding = 8; // Space between border and QR code

          // Draw QR border with padding
          page.drawRectangle({
            x: qrX - qrPadding,
            y: qrY - qrPadding,
            width: qrSize + qrPadding * 2,
            height: qrSize + qrPadding * 2,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          page.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });

          y = qrY - 10;
        } catch (imgError) {
          const embedErrorMsg =
            imgError instanceof Error
              ? imgError.message
              : 'Unknown QR image embedding error';
          console.error(
            `Error embedding QR for ${purchaseIdFromRequest}: ${embedErrorMsg}`
          );

          const errorText = '[QR CODE INDISPONIBLE]';
          page.drawText(errorText, {
            x: (receiptWidth - 90) / 2,
            y: y - 15,
            size: 6,
            font: helvetica,
            color: rgb(0.8, 0.2, 0.2),
          });
          y -= 25;
        }
      } else {
        const missingText = '[QR UNAVAILABLE]';
        page.drawText(missingText, {
          x: (receiptWidth - 90) / 2,
          y: y - 15,
          size: 6,
          font: helvetica,
          color: greyColor,
        });
        y -= 25;
      }

      // Footer messages at bottom right
      const legacyBottomY = 25; // Very bottom of page

      const legacyFooterMsg1 = "Présentez ce code QR à l'entrée";
      const legacyFooterMsg1Width = helvetica.widthOfTextAtSize(
        legacyFooterMsg1,
        5
      );
      page.drawText(legacyFooterMsg1, {
        x: legacyRightAlignX - legacyFooterMsg1Width,
        y: legacyBottomY,
        size: 5,
        font: helvetica,
        color: greyColor,
      });

      const legacyFooterMsg2 = 'Merci de soutenir le mouvement!';
      const legacyFooterMsg2Width = helvetica.widthOfTextAtSize(
        legacyFooterMsg2,
        5
      );
      page.drawText(legacyFooterMsg2, {
        x: legacyRightAlignX - legacyFooterMsg2Width,
        y: legacyBottomY - 8,
        size: 5,
        font: helvetica,
        color: greyColor,
      });

      const pdfBytes = await pdfDoc.save();
      pdfsToAttach.push({
        filename: `Ticket-${ticketProps.ticketIdentifier}.pdf`,
        content: uint8ArrayToBase64(pdfBytes),
      });
    }

    // --- 5. Send Email with Resend (with PDF attachment) ---
    // Fetch and embed the logo image as Base64 to prevent email clients from blocking it.
    // This is wrapped in its own try-catch to NEVER fail the entire function
    let logoSrc = defaultLogoUrl; // Always have a fallback URL

    try {
      console.log('Fetching logo from Supabase Storage...');

      // First, try to get the image from Supabase Storage
      const { data: logoData, error: logoError } = await supabase.storage
        .from('assets')
        .download('logo.png');

      if (logoData && !logoError) {
        try {
          const logoBytes = new Uint8Array(await logoData.arrayBuffer());
          const logoBase64 = uint8ArrayToBase64(logoBytes);
          logoSrc = `data:image/png;base64,${logoBase64}`;
          console.log(
            'Successfully fetched and encoded logo from Supabase Storage.'
          );
        } catch (conversionError) {
          console.warn(
            'Failed to convert Supabase logo to Base64, using URL fallback:',
            conversionError
          );
        }
      } else {
        console.warn(
          'Logo not found in Supabase Storage, trying direct URL fetch...'
        );

        // Fallback: try direct fetch from the URL
        try {
          const logoResponse = await fetch(defaultLogoUrl);
          if (logoResponse.ok) {
            const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
            const logoBase64 = uint8ArrayToBase64(logoBytes);
            logoSrc = `data:image/png;base64,${logoBase64}`;
            console.log('Successfully fetched logo via direct URL.');
          } else {
            console.warn(
              `Failed to fetch logo (status: ${logoResponse.status}), using URL as final fallback.`
            );
          }
        } catch (urlFetchError) {
          console.warn(
            'Failed to fetch logo via URL, using URL as final fallback:',
            urlFetchError
          );
        }
      }
    } catch (logoError) {
      // This catch block should NEVER be reached due to nested try-catches above
      // But it's here as a final safety net
      console.error(
        'Unexpected error in logo fetching, using URL fallback:',
        logoError
      );
    }

    const emailHtmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre ticket pour ${ticketProps.eventName}</title>
        <style type="text/css">
          .logo-img { width: 100px; height: auto; border-radius: 6px; object-fit: contain; }
          .email-header { padding: 20px; text-align: center; background-color: #ffffff; }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333;">
        
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div class="email-header">
            <img src="${logoSrc}" alt="Kamayakoi" class="logo-img" />
          </div>
          
          <div style="padding: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;"><strong>${ticketProps.eventName} ${ticketProps.eventVenue}</strong></h1>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Bonjour ${ticketProps.firstName}, votre billet pour ${ticketProps.eventName} est prêt et vous attend.
          </p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Merci de soutenir le mouvement.
            ${ticketProps.isBundle ? `<br><br>Vous avez réservé ${ticketProps.bundleQuantity} pack(s) comprenant ${ticketProps.quantity} accès au total.` : ''}
            ${ticketProps.useIndividualTickets ? `<br><br><strong>🎫 Vous recevez ${ticketProps.quantity} codes individuels</strong> - un par personne.` : ''}
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; margin-top: 0;">Détails du billet</h2>

            <p style="margin: 8px 0; font-size: 14px;">
              <strong>Référence :</strong> ${ticketProps.ticketIdentifier}
            </p>

            <p style="margin: 8px 0; font-size: 14px;">
              <strong>Date :</strong> ${ticketProps.eventDate} à ${ticketProps.eventTime}
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${
              ticketProps.useIndividualTickets
                ? `Vos ${ticketProps.quantity} codes QR d'accès sont joints à cet email. Chaque invité devra présenter le sien à l'entrée.`
                : `Votre code QR d'accès est en pièce jointe. Gardez-le sécurisé et montrez-le nous lors de votre arrivée.`
            }
          </p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Pour toute question ou précision, n'hésitez pas à nous écrire en réponse à ce message.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Kamayakoi
          </p>
          
          </div>
        </div>
        
      </body>
      </html>`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Kamayakoi <${fromEmail}>`,
      to: ticketProps.email,
      reply_to: 'kamayakoi@gmail.com',
      subject: `Votre ticket pour ${ticketProps.eventName}`,
      html: emailHtmlBody,
      attachments: pdfsToAttach,
    });

    if (emailError) {
      const resendErrorMsg =
        emailError instanceof Error
          ? emailError.message
          : JSON.stringify(emailError);
      console.error(
        `Resend error for purchase ${purchaseIdFromRequest}:`,
        resendErrorMsg
      );
      await supabase.rpc('update_email_dispatch_status', {
        p_purchase_id: purchaseIdFromRequest,
        p_email_dispatch_status: 'DISPATCH_FAILED',
        p_email_dispatch_error: `Resend API error: ${resendErrorMsg}`,
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: resendErrorMsg,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // --- 6. Update Purchase Record on Success ---
    console.log(
      `send-ticket-email: Email sent successfully for purchase ${purchaseIdFromRequest}. Email ID: ${emailData?.id}`
    );
    await supabase.rpc('update_email_dispatch_status', {
      p_purchase_id: purchaseIdFromRequest,
      p_email_dispatch_status: 'SENT_SUCCESSFULLY',
      p_pdf_ticket_generated: true,
      p_pdf_ticket_sent_at: new Date().toISOString(),
      p_email_dispatch_error: null,
    });

    console.log(
      `Email with PDF sent for ${purchaseIdFromRequest}. Email ID: ${emailData?.id}`
    );
    return new Response(
      JSON.stringify({
        message: 'Ticket email with PDF sent successfully!',
        email_id: emailData?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred';
    console.error(
      `Unexpected error for ${purchaseIdFromRequest || 'unknown'}:`,
      e
    );
    if (purchaseIdFromRequest) {
      try {
        const supabaseForErrorFallback = createClient(
          supabaseUrl!,
          supabaseServiceRoleKey!
        );
        await supabaseForErrorFallback.rpc('update_email_dispatch_status', {
          p_purchase_id: purchaseIdFromRequest,
          p_email_dispatch_status: 'DISPATCH_FAILED',
          p_email_dispatch_error: `Unexpected error: ${errorMessage}`,
        });
      } catch (updateError) {
        console.error(
          `Failed to update error status for ${purchaseIdFromRequest}:`,
          updateError
        );
      }
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
