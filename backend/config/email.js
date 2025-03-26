import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are missing. Check your .env file.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Use an App Password if 2FA is enabled
    },
  });
};

// Verify SMTP connection only in development mode
if (process.env.NODE_ENV !== "production") {
  const transporter = createTransporter();
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Connection Error:", error);
    } else {
      console.log("✅ SMTP Server is ready");
    }
  });
}

export default createTransporter;
