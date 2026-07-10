import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Sends email via Gmail SMTP using an app password. Configure with env vars:
//   SMTP_USER = your Gmail address (e.g. silverbasetech.in@gmail.com)
//   SMTP_PASS = a Google "App Password" (16 chars, not your normal password)
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export function mailerConfigured(): boolean {
  return Boolean(user && pass);
}

let transporter: Transporter | null = null;
function getTransport(): Transporter | null {
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransport();
  if (!t) throw new Error("Email is not configured (missing SMTP_USER/SMTP_PASS).");
  await t.sendMail({ from: `Home Dining <${user}>`, to, subject, html });
}
