// Shared layout wrapper
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Hybrid EdTech</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; color: #1a202c; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #48BB78 100%); padding: 36px 40px; text-align: center; }
    .header img { width: 48px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px; }
    .body h2 { font-size: 20px; color: #2d3748; margin-bottom: 8px; }
    .body p { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 16px; }
    .otp-box { background: linear-gradient(135deg, #EBF4FF, #E9D8FD); border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0; }
    .otp-box .otp { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #6C63FF; }
    .otp-box .expiry { font-size: 13px; color: #718096; margin-top: 8px; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-pending   { background: #FEF3C7; color: #92400E; }
    .badge-accepted  { background: #D1FAE5; color: #065F46; }
    .badge-rejected  { background: #FEE2E2; color: #991B1B; }
    .badge-completed { background: #DBEAFE; color: #1E40AF; }
    .info-card { background: #F7FAFC; border-left: 4px solid #6C63FF; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
    .info-card .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #EDF2F7; font-size: 14px; }
    .info-card .row:last-child { border-bottom: none; }
    .info-card .label { color: #718096; font-weight: 500; }
    .info-card .value { color: #2d3748; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6C63FF, #48BB78); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid #EDF2F7; margin: 24px 0; }
    .footer { background: #F7FAFC; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #A0AEC0; line-height: 1.8; }
    .footer a { color: #6C63FF; text-decoration: none; }
    .warning { background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400E; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 Hybrid EdTech</h1>
      <p>Connecting Students with Expert Tutors</p>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hybrid EdTech. All rights reserved.<br/>
      You received this email because you have an account with us.<br/>
      <a href="#">Privacy Policy</a> &nbsp;·&nbsp; <a href="#">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>`;

// ─── OTP: Registration ────────────────────────────────────────────────────────
const registerOtp = ({ name, otp, expiryMinutes }) => ({
  subject: '🔐 Verify Your Email — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Welcome, ${name}! 👋</h2>
      <p>Thanks for joining <strong>Hybrid EdTech</strong>. Use the OTP below to verify your email address and complete your registration.</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="expiry">⏱ Expires in ${expiryMinutes} minutes</div>
      </div>
      <p>Enter this code on the verification page to activate your account.</p>
      <div class="warning">⚠️ Never share this OTP with anyone. Our team will never ask for it.</div>
    </div>`),
});

// ─── OTP: Login ───────────────────────────────────────────────────────────────
const loginOtp = ({ name, otp, expiryMinutes }) => ({
  subject: '🔑 Your Login OTP — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Hello, ${name}!</h2>
      <p>Use the OTP below to log in to your <strong>Hybrid EdTech</strong> account.</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="expiry">⏱ Expires in ${expiryMinutes} minutes</div>
      </div>
      <p>If you didn't request this, please ignore this email — your account is safe.</p>
      <div class="warning">⚠️ Never share this OTP with anyone.</div>
    </div>`),
});

// ─── Booking: Created (to Student) ───────────────────────────────────────────
const bookingCreated = ({ studentName, tutorName, mode, dateTime, note }) => ({
  subject: '📚 Booking Request Sent — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Booking Request Sent! 🎉</h2>
      <p>Hi <strong>${studentName}</strong>, your booking request has been sent to <strong>${tutorName}</strong>. You'll be notified once they respond.</p>
      <div class="info-card">
        <div class="row"><span class="label">Tutor</span><span class="value">${tutorName}</span></div>
        <div class="row"><span class="label">Mode</span><span class="value">${mode}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
        ${note ? `<div class="row"><span class="label">Note</span><span class="value">${note}</span></div>` : ''}
        <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-pending">PENDING</span></span></div>
      </div>
      <p>We'll send you an update as soon as the tutor responds.</p>
    </div>`),
});

// ─── Booking: New Request (to Tutor) ─────────────────────────────────────────
const bookingRequest = ({ tutorName, studentName, mode, dateTime, note }) => ({
  subject: '🔔 New Booking Request — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>New Booking Request! 📬</h2>
      <p>Hi <strong>${tutorName}</strong>, you have a new booking request from <strong>${studentName}</strong>.</p>
      <div class="info-card">
        <div class="row"><span class="label">Student</span><span class="value">${studentName}</span></div>
        <div class="row"><span class="label">Mode</span><span class="value">${mode}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
        ${note ? `<div class="row"><span class="label">Note</span><span class="value">${note}</span></div>` : ''}
      </div>
      <p>Please log in to your dashboard to accept or reject this request.</p>
    </div>`),
});

// ─── Booking: Accepted (to Student) ──────────────────────────────────────────
const bookingAccepted = ({ studentName, tutorName, mode, dateTime }) => ({
  subject: '✅ Booking Accepted — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Your Booking is Confirmed! ✅</h2>
      <p>Great news, <strong>${studentName}</strong>! <strong>${tutorName}</strong> has accepted your booking.</p>
      <div class="info-card">
        <div class="row"><span class="label">Tutor</span><span class="value">${tutorName}</span></div>
        <div class="row"><span class="label">Mode</span><span class="value">${mode}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-accepted">ACCEPTED</span></span></div>
      </div>
      <p>Be ready at the scheduled time. Good luck with your session! 🚀</p>
    </div>`),
});

// ─── Booking: Rejected (to Student) ──────────────────────────────────────────
const bookingRejected = ({ studentName, tutorName, mode, dateTime }) => ({
  subject: '❌ Booking Rejected — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Booking Update</h2>
      <p>Hi <strong>${studentName}</strong>, unfortunately <strong>${tutorName}</strong> was unable to accept your booking request.</p>
      <div class="info-card">
        <div class="row"><span class="label">Tutor</span><span class="value">${tutorName}</span></div>
        <div class="row"><span class="label">Mode</span><span class="value">${mode}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-rejected">REJECTED</span></span></div>
      </div>
      <p>Don't worry — there are many other great tutors available. Browse and book another session!</p>
    </div>`),
});

// ─── Booking: Completed (to both) ────────────────────────────────────────────
const bookingCompleted = ({ recipientName, otherName, role, mode, dateTime }) => ({
  subject: '🎓 Session Completed — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Session Completed! 🎓</h2>
      <p>Hi <strong>${recipientName}</strong>, your session with <strong>${otherName}</strong> has been marked as completed.</p>
      <div class="info-card">
        <div class="row"><span class="label">${role === 'STUDENT' ? 'Tutor' : 'Student'}</span><span class="value">${otherName}</span></div>
        <div class="row"><span class="label">Mode</span><span class="value">${mode}</span></div>
        <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(dateTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-completed">COMPLETED</span></span></div>
      </div>
      ${role === 'STUDENT' ? '<p>We hope the session was helpful! Keep learning and growing. 💪</p>' : '<p>Great work! Thank you for being an amazing tutor. 🌟</p>'}
    </div>`),
});

// ─── Contact Enquiry (to admin/tutor) ────────────────────────────────────────
const contactEnquiry = ({ senderName, senderEmail, message, tutorId, tutorName }) => ({
  subject: '📩 New Contact Enquiry — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>New Contact Enquiry 📩</h2>
      <p>You have received a new message via the Hybrid EdTech contact form.</p>
      <div class="info-card">
        <div class="row"><span class="label">From</span><span class="value">${senderName}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${senderEmail}</span></div>
        ${tutorName ? `<div class="row"><span class="label">Enquiring About</span><span class="value">${tutorName}</span></div>` : ''}
        ${tutorId ? `<div class="row"><span class="label">Tutor Profile ID</span><span class="value">${tutorId}</span></div>` : ''}
        <div class="row"><span class="label">Message</span><span class="value">${message}</span></div>
      </div>
      <p>Please follow up with the enquirer at your earliest convenience.</p>
    </div>`),
});

// ─── Contact: Auto-reply (to sender) ─────────────────────────────────────────
const contactAutoReply = ({ senderName }) => ({
  subject: '✉️ We Received Your Message — Hybrid EdTech',
  html: layout(`
    <div class="body">
      <h2>Thanks for reaching out, ${senderName}! 👋</h2>
      <p>We've received your message and our team will get back to you within <strong>24–48 hours</strong>.</p>
      <hr class="divider"/>
      <p>In the meantime, feel free to browse our tutors and explore available sessions.</p>
    </div>`),
});

module.exports = {
  registerOtp,
  loginOtp,
  bookingCreated,
  bookingRequest,
  bookingAccepted,
  bookingRejected,
  bookingCompleted,
  contactEnquiry,
  contactAutoReply,
};
