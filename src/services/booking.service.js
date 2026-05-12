const bookingRepo = require('../repositories/booking.repository');
const tutorRepo   = require('../repositories/tutorProfile.repository');
const userRepo    = require('../repositories/user.repository');
const AppError    = require('../utils/AppError');
const { BOOKING_STATUS, ROLES, CANCELLED_BY } = require('../constants');
const { enqueueEmail } = require('../jobs/email.queue');

const createBooking = async (student_id, data) => {
  const tutorProfile = await tutorRepo.findByUserId(data.tutor_id);
  if (!tutorProfile) throw new AppError('Tutor profile not found', 404);

  const booking = await bookingRepo.create({ ...data, student_id });

  const [student, tutor] = await Promise.all([
    userRepo.findById(student_id),
    userRepo.findById(data.tutor_id),
  ]);

  await enqueueEmail('bookingCreated', student.email, {
    studentName: student.name, tutorName: tutor.name,
    mode: data.mode, dateTime: data.date_time, note: data.note,
  });
  await enqueueEmail('bookingRequest', tutor.email, {
    tutorName: tutor.name, studentName: student.name,
    mode: data.mode, dateTime: data.date_time, note: data.note,
  });

  return booking;
};

const getStudentBookings = async (student_id, pagination) => {
  const [bookings, total] = await bookingRepo.findByStudent(student_id, pagination);
  return { bookings, pagination: _buildPagination(total, pagination) };
};

const getTutorBookings = async (tutor_id, pagination) => {
  const [bookings, total] = await bookingRepo.findByTutor(tutor_id, pagination);
  return { bookings, pagination: _buildPagination(total, pagination) };
};

const updateBookingStatus = async (bookingId, status, user) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  if (user.role === ROLES.TUTOR && booking.tutor_id.toString() !== user._id.toString())
    throw new AppError('Forbidden', 403);

  if (user.role === ROLES.STUDENT) {
    if (booking.student_id.toString() !== user._id.toString()) throw new AppError('Forbidden', 403);
    if (status !== BOOKING_STATUS.COMPLETED) throw new AppError('Students can only mark as COMPLETED', 403);
    if (booking.status !== BOOKING_STATUS.ACCEPTED) throw new AppError('Booking must be ACCEPTED first', 400);
  }

  const updated = await bookingRepo.updateStatus(bookingId, status);

  const [student, tutor] = await Promise.all([
    userRepo.findById(booking.student_id),
    userRepo.findById(booking.tutor_id),
  ]);

  if (status === BOOKING_STATUS.ACCEPTED) {
    await enqueueEmail('bookingAccepted', student.email, {
      studentName: student.name, tutorName: tutor.name,
      mode: booking.mode, dateTime: booking.date_time,
    });
  } else if (status === BOOKING_STATUS.REJECTED) {
    await enqueueEmail('bookingRejected', student.email, {
      studentName: student.name, tutorName: tutor.name,
      mode: booking.mode, dateTime: booking.date_time,
    });
  } else if (status === BOOKING_STATUS.COMPLETED) {
    await Promise.all([
      enqueueEmail('bookingCompleted', student.email, {
        recipientName: student.name, otherName: tutor.name,
        role: ROLES.STUDENT, mode: booking.mode, dateTime: booking.date_time,
      }),
      enqueueEmail('bookingCompleted', tutor.email, {
        recipientName: tutor.name, otherName: student.name,
        role: ROLES.TUTOR, mode: booking.mode, dateTime: booking.date_time,
      }),
    ]);
  }

  return updated;
};

const cancelBooking = async (bookingId, user, cancel_reason) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  const isStudent = booking.student_id.toString() === user._id.toString();
  const isTutor   = booking.tutor_id.toString()   === user._id.toString();
  if (!isStudent && !isTutor) throw new AppError('Forbidden', 403);

  if (booking.status === BOOKING_STATUS.COMPLETED)
    throw new AppError('Cannot cancel a completed booking', 400);
  if (booking.status === BOOKING_STATUS.CANCELLED)
    throw new AppError('Booking already cancelled', 400);

  const cancelled_by = isStudent ? CANCELLED_BY.STUDENT : CANCELLED_BY.TUTOR;
  return bookingRepo.cancel(bookingId, cancelled_by, cancel_reason);
};

const _buildPagination = (total, { page, limit }) => ({
  total, page, limit, pages: Math.ceil(total / limit),
});

module.exports = { createBooking, getStudentBookings, getTutorBookings, updateBookingStatus, cancelBooking };
