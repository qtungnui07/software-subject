const nodemailer = require("nodemailer");

const recipient = String(process.argv[2] || "").trim();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  console.error("Usage: npm run email:test -- user@example.com");
  process.exit(1);
}

if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
  console.error("SMTP_HOST and SMTP_PASS must be configured");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = async () => {
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM || "Robogo <noreply@qtitpc.dev>",
    to: recipient,
    subject: "Robogo - Kiểm tra email nhắc học",
    text: "Email thử đã được gửi thành công từ hệ thống Robogo.",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#243746">
        <h1 style="color:#1486cc">Robogo gửi mail thành công!</h1>
        <p>Đây là email thử cho tính năng nhắc học.</p>
        <p>Nếu bạn nhận được email này, cấu hình Resend SMTP đang hoạt động bình thường.</p>
      </div>
    `,
  });

  console.log(`Test email accepted for ${recipient}`);
  console.log(`Message ID: ${info.messageId}`);
};

send().catch((error) => {
  console.error("Failed to send test email:", error.message);
  process.exit(1);
});
