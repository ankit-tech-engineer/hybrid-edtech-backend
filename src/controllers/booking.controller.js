const bookingService = require('../services/booking.service');
const { successResponse } = require('../utils/response');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    successResponse(res, booking, 'Booking created', 201);
  } catch (err) { next(err); }
};

const getStudentBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getStudentBookings(req.user._id, req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

const getTutorBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getTutorBookings(req.user._id, req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

const updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status, req.user);
    successResponse(res, booking, 'Booking updated');
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user, req.body.cancel_reason);
    successResponse(res, booking, 'Booking cancelled');
  } catch (err) { next(err); }
};

module.exports = { createBooking, getStudentBookings, getTutorBookings, updateBooking, cancelBooking };
