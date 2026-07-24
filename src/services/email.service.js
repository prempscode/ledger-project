require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Bank" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Bank!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Bank.\n\nYour account is now active and ready to use.`;

    const html = `
<div style="background-color:#0d0d0f; padding:40px 0; font-family:'Segoe UI', Arial, sans-serif;">
  <table align="center" width="380" style="background:#16161a; border-radius:16px; overflow:hidden; border:1px solid #26262c; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
    
    <!-- Banner Image -->
    <tr>
      <td>
        <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80" 
             alt="Backend Bank" width="480" style="display:block; width:100%; height:180px; object-fit:cover;" />
      </td>
    </tr>

    <!-- Logo / Icon -->
    <tr>
      <td align="center" style="padding-top:24px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" 
             alt="Bank Icon" width="56" height="56" style="filter:invert(1) opacity(0.9);" />
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:20px 32px 36px 32px; color:#e4e4e7; text-align:center;">
        <h2 style="color:#ffffff; font-weight:600; margin-bottom:8px;">
          Welcome, ${name} 👋
        </h2>
        <p style="color:#a1a1aa; font-size:14px; line-height:1.6; margin:0 0 20px 0;">
          Thank you for registering at <strong style="color:#ffffff;">Backend Bank</strong>.<br/>
          Your account has been created successfully and is ready to use.
        </p>

        <a href="#" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); 
           color:#fff; text-decoration:none; padding:12px 28px; border-radius:10px; 
           font-size:14px; font-weight:500; letter-spacing:0.3px;">
          Hello 😊
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#101012; padding:16px 32px; text-align:center; border-top:1px solid #26262c;">
        <p style="color:#5f5f66; font-size:8px; margin:0;">
          © ${new Date().getFullYear()} Backend Bank · Secure Digital Banking
        </p>
      </td>
    </tr>

  </table>
</div>
`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendLoginEmail(userEmail, name) {
    const subject = 'New Login to Your Backend Bank Account';
    const text = `Hello ${name},\n\nWe noticed a new login to your Backend Bank account.\n\nIf this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.`;

    const html = `
<div style="background-color:#0d0d0f; padding:40px 0; font-family:'Segoe UI', Arial, sans-serif;">
  <table align="center" width="380" style="background:#16161a; border-radius:16px; overflow:hidden; border:1px solid #26262c; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
    
    <!-- Banner Image -->
    <tr>
      <td>
        <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80" 
             alt="Backend Bank" width="480" style="display:block; width:100%; height:180px; object-fit:cover;" />
      </td>
    </tr>

    <!-- Logo / Icon -->
    <tr>
      <td align="center" style="padding-top:24px;">
        <img src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" 
             alt="Bank Icon" width="56" height="56" style="filter:invert(1) opacity(0.9);" />
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:20px 32px 36px 32px; color:#e4e4e7; text-align:center;">
        <h2 style="color:#ffffff; font-weight:600; margin-bottom:8px;">
          New Login Detected 🔐
        </h2>
        <p style="color:#a1a1aa; font-size:14px; line-height:1.6; margin:0 0 12px 0;">
          Hello <strong style="color:#ffffff;">${name}</strong>,<br/>
          We noticed a new login to your Backend Bank account. If this was you, no action is needed.
        </p>
        <p style="color:#f87171; font-size:12px; line-height:1.5; margin:0 0 20px 0;">
          Didn't recognize this activity? Secure your account now.
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#101012; padding:16px 32px; text-align:center; border-top:1px solid #26262c;">
        <p style="color:#5f5f66; font-size:8px; margin:0;">
          © ${new Date().getFullYear()} Backend Bank · Secure Digital Banking
        </p>
      </td>
    </tr>

  </table>
</div>
`;
    await sendEmail(userEmail, subject, text, html);
}


module.exports = { sendRegistrationEmail, sendLoginEmail, transporter };
