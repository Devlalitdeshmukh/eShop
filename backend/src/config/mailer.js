import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter = null;

export const getMailer = () => {
  if (transporter) {
    return transporter;
  }

  if (!env.ADMIN_EMAIL || !env.ADMIN_EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.ADMIN_EMAIL,
      pass: env.ADMIN_EMAIL_PASS,
    },
  });

  return transporter;
};

export const sendMailSafe = async (options) => {
  const mailer = getMailer();
  if (!mailer) {
    return false;
  }
  await mailer.sendMail(options);
  return true;
};
