import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (email, subject, text, html) => {
    const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
  const mailOptions = {
    from: "Nodemailer <noreply@nodemailer.com>",
    to: email,
    subject: subject,
    text: text,
    html: html
  }
  await transport.sendMail(mailOptions);
}