"use server";

export async function sendEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const type = formData.get("type") as string;
    const subject = formData.get("subject") as string;

    if (!email) {
      return { error: "Email is required" };
    }

    // Handle newsletter subscriptions
    if (type === "newsletter") {
      try {
        // Send notification email to kamayakoi@gmail.com
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "newsletter@updates.kamayakoi.com",
            to: "kamayakoi@gmail.com",
            subject: subject || "New Newsletter Subscription",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Newsletter Subscription</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p>This person has subscribed to the Kamayakoi newsletter.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send newsletter notification");
        }

        return { success: "Successfully subscribed to newsletter!" };
      } catch (error) {
        console.error("Newsletter subscription error:", error);
        return { error: "Failed to subscribe. Please try again." };
      }
    }

    // Handle regular contact form
    if (!message) {
      return { error: "Message is required" };
    }

    // For regular contact messages, you can implement email sending here
    return { success: "Message sent successfully" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
