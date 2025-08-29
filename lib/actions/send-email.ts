"use server";

export async function sendEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!email || !message) {
      return { error: "All fields are required" };
    }

    // For now, we'll just show a success message
    // In a real implementation, you'd integrate with Resend or another email service
    return { success: "Email sent successfully" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
