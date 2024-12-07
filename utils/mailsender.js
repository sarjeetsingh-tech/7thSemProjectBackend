const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let info = await transporter.sendMail({
      from: "Sarjeet Singh - CampusVibes",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    return info; // Return the result to be handled by the caller
  } catch (error) {
    console.log("Error in mailSender", error.message);
    throw error; // Throw the error to be caught by the caller
  }
};

module.exports = mailSender;
