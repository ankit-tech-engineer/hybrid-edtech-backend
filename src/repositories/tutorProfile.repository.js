const TutorProfile = require('../models/TutorProfile');

const upsert = (user_id, data) =>
  TutorProfile.findOneAndUpdate({ user_id }, { ...data, user_id }, {
    new: true,
    upsert: true,
    runValidators: true,
  }).lean();

const findByUserId = (user_id) =>
  TutorProfile.findOne({ user_id }).populate('user_id', 'name email avatar').lean();

const findById = (id) =>
  TutorProfile.findById(id).populate('user_id', 'name email avatar').lean();

const search = ({ subject, mode, city, page = 1, limit = 10, sortByPrice }) => {
  const filter = {};
  if (subject) filter.subjects = { $in: [subject] };
  if (mode)    filter.mode = mode;
  if (city)    filter['location.city'] = new RegExp(city, 'i');

  // Sort priority: trust_score DESC → price (if requested) → price ASC fallback
  const sort = { trust_score: -1 };
  if (sortByPrice) sort.price_per_hour = sortByPrice === 'asc' ? 1 : -1;
  else sort.price_per_hour = 1;

  const skip = (page - 1) * limit;

  return Promise.all([
    TutorProfile.find(filter).sort(sort).skip(skip).limit(limit)
      .populate('user_id', 'name email avatar').lean(),
    TutorProfile.countDocuments(filter),
  ]);
};

const updateAvailability = (user_id, availability) =>
  TutorProfile.findOneAndUpdate({ user_id }, { availability }, { new: true }).lean();

const updateTrustScore = (user_id, trust_score) =>
  TutorProfile.findOneAndUpdate({ user_id }, { trust_score }, { new: true }).lean();

// Used by cron: get all tutor user_ids
const findAllUserIds = () =>
  TutorProfile.find({}, { user_id: 1 }).lean();

module.exports = { upsert, findByUserId, findById, search, updateAvailability, updateTrustScore, findAllUserIds };
