const { enqueueEmail } = require('../jobs/email.queue');
const config = require('../config');
const tutorRepo = require('../repositories/tutorProfile.repository');

const handleContact = async ({ name, email, message, tutor_id }) => {
  const recipients = [config.smtp.user]; // always notify admin
  let tutorName = null;

  // If tutor_id provided, also send directly to that tutor
  if (tutor_id) {
    const tutorProfile = await tutorRepo.findById(tutor_id);
    if (tutorProfile && tutorProfile.user_id) {
      const tutorEmail = tutorProfile.user_id.email;
      tutorName = tutorProfile.user_id.name;
      if (tutorEmail && tutorEmail !== config.smtp.user) {
        recipients.push(tutorEmail);
      }
    }
  }

  // Send enquiry to all recipients (admin + tutor if applicable)
  await Promise.all(
    recipients.map((to) =>
      enqueueEmail('contactEnquiry', to, {
        senderName: name,
        senderEmail: email,
        message,
        tutorId: tutor_id || null,
        tutorName,
      })
    )
  );

  // Auto-reply to the sender
  await enqueueEmail('contactAutoReply', email, { senderName: name });

  return { received: true };
};

module.exports = { handleContact };
