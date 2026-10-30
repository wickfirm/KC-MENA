import nodemailer from "nodemailer";

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

/** Sends one plain-text message. Returns an error string when mail is not configured or the send fails. */
export async function sendMail(input: { to: string; subject: string; text: string }): Promise<string | null> {
  if (!mailConfigured()) return "Email is not configured (set SMTP_HOST and SMTP_FROM).";
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.SMTP_FROM, to: input.to, subject: input.subject, text: input.text });
    return null;
  } catch (error) {
    console.error("sendMail error:", error);
    return "The notification email could not be sent.";
  }
}
