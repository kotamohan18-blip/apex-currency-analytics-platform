const { Resend } = require('resend');
const resend = new Resend('re_9LkQ8n6a_5hQTMd3r3FS3j6N2HA5Kfm3z');

async function test() {
  try {
    console.log("📧 Sending OTP to:", 'vu.241fa04167@gmail.com');
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vu.241fa04167@gmail.com',
      subject: 'Your OTP Code',
      html: `<h2>Your OTP is: 123456</h2>`
    });
    console.log("✅ EMAIL SENT:", response);
  } catch(e) {
    console.error("❌ EMAIL ERROR:", e);
  }
}
test();
