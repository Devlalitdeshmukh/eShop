import { env } from "../src/config/env.js";
import { getMailer } from "../src/config/mailer.js";

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const sendAdminInquiryMail = async (data) => {
  const user = env.ADMIN_EMAIL;
  if (!user) {
    return;
  }

  const transporter = getMailer();
  if (!transporter) {
    return;
  }

  const subject = "New Inquiry Received";

  await transporter.sendMail({
    from: `Website Inquiry <${user}>`,
    to: user,
    subject,
    html: `
      <h3>New Inquiry</h3>
      <p><b>Name:</b> ${escapeHtml(data.name)}</p>
      <p><b>Email:</b> ${escapeHtml(data.email)}</p>
      <p><b>Phone:</b> ${escapeHtml(data.phone || "-")}</p>
      <p><b>Type:</b> ${escapeHtml(data.inquiry_type)}</p>
      <p><b>Message:</b><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
    `,
  });
};
