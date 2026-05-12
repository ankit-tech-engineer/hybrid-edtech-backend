const contactService = require('../services/contact.service');
const { successResponse } = require('../utils/response');

const contact = async (req, res, next) => {
  try {
    const result = await contactService.handleContact(req.body);
    successResponse(res, result, 'Message received. We will get back to you shortly.');
  } catch (err) { next(err); }
};

module.exports = { contact };
