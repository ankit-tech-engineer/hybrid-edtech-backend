require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const User = require('./models/User');
const TutorProfile = require('./models/TutorProfile');
const Booking = require('./models/Booking');
const OTP = require('./models/OTP');
const { ROLES, TUTOR_MODES, BOOKING_STATUS } = require('./constants');

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany(), TutorProfile.deleteMany(), Booking.deleteMany(), OTP.deleteMany()]);
  console.log('Cleared existing data');

  const password = await bcrypt.hash('Password@123', config.bcryptRounds);

  const [admin, student, tutor1, tutor2] = await User.insertMany([
    {
      name: 'Super Admin',
      email: 'admin@example.com',
      phone: '+1000000000',
      password,
      role: ROLES.ADMIN,
      is_verified: true,
      is_active: true,
    },
    {
      name: 'Alice Student',
      email: 'student@example.com',
      phone: '+1234567890',
      password,
      role: ROLES.STUDENT,
      is_verified: true,
      is_active: true,
    },
    {
      name: 'Bob Tutor',
      email: 'tutor1@example.com',
      phone: '+1234567891',
      password,
      role: ROLES.TUTOR,
      is_verified: true,
      is_active: true,
    },
    {
      name: 'Carol Tutor',
      email: 'tutor2@example.com',
      phone: '+1234567892',
      password,
      role: ROLES.TUTOR,
      is_verified: true,
      is_active: true,
    },
  ]);

  const [profile1] = await TutorProfile.insertMany([
    {
      user_id: tutor1._id,
      subjects: ['Mathematics', 'Physics'],
      mode: TUTOR_MODES.BOTH,
      price_per_hour: 50,
      location: { city: 'New York', area: 'Manhattan' },
      bio: 'Experienced math and physics tutor with 8 years of teaching.',
      experience: 8,
    },
    {
      user_id: tutor2._id,
      subjects: ['English', 'Literature'],
      mode: TUTOR_MODES.ONLINE,
      price_per_hour: 35,
      location: { city: 'Los Angeles', area: 'Downtown' },
      bio: 'English language specialist with focus on creative writing.',
      experience: 5,
    },
  ]);

  await Booking.create({
    student_id: student._id,
    tutor_id: tutor1._id,
    mode: TUTOR_MODES.ONLINE,
    date_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: BOOKING_STATUS.PENDING,
    note: 'Need help with calculus',
  });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('--- Test Credentials (password: Password@123) ---');
  console.log(`Admin   : admin@example.com`);
  console.log(`Student : student@example.com`);
  console.log(`Tutor 1 : tutor1@example.com`);
  console.log(`Tutor 2 : tutor2@example.com`);
  console.log(`Tutor Profile ID: ${profile1._id}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
