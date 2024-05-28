import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendLoginMail(email, username) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${username}, you have signed in ✔`,
    text: `Dear ${username}, you have signed in into the social-media app`,
    html: `<b>Dear ${username}, you have signed in into the test app</b>`,
  });

  console.log("Message sent: %s", info.messageId);
}



export async function sendForgotPasswordEmail(email, username, token) {

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Reset password`,
    text: `Click here to reset your password: https://social-media-vert-seven.vercel.app/resetpassword?token=${token} `,
    html: `<b>Click here to reset your password</b> https://social-media-vert-seven.vercel.app/resetpassword?token=${token}`,
  });
  console.log("Message sent: %s", info.messageId);
}

