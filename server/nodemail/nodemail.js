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

// async..await is not allowed in global scope, must use a wrapper
export async function sendLoginMail(email, username) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: email, // list of receivers, separated by commas
    subject: `${username}, you have signed in ✔`, // Subject line
    text: `Dear ${username}, you have signed in into the test app`, // plain text body
    html: `<b>Dear ${username}, you have signed in into the test app</b>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}


// async..await is not allowed in global scope, must use a wrapper
export async function sendForgotPasswordEmail(email, username, token) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: email, // list of receivers, separated by commas
    subject: `Reset password`, // Subject line
    text: `Click here to reset your password: http://localhost:5173/resetpassword?token=${token} `, // plain text body
    html: `<b>Click here to reset your password</b> http://localhost:5173/resetpassword?token=${token}`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

