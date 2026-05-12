const tutorRepo = require('../repositories/tutorProfile.repository');
const userRepo = require('../repositories/user.repository');
const AppError  = require('../utils/AppError');
const cache     = require('../utils/cache');
const config    = require('../config');

const CACHE_PREFIX = 'tutor_search:';

const upsertProfile = async (user_id, data) => {
  const profile = await tutorRepo.upsert(user_id, data);
  await cache.delByPattern(`${CACHE_PREFIX}*`);
  return profile;
};

const getMyProfile = async (user_id) => {
  console.log(">>>>>>>>>>>>>>>>>>",user_id)
  const profile = await tutorRepo.findByUserId(user_id);
  if (!profile) throw new AppError('Profile not found', 404);
  return profile;
};

const getTutorById = async (id) => {
  const profile = await tutorRepo.findById(id);
  if (!profile) throw new AppError('Tutor not found', 404);
  return profile;
};

const searchTutors = async (filters) => {
  const cacheKey = `${CACHE_PREFIX}${JSON.stringify(filters)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const [tutors, total] = await tutorRepo.search(filters);
  const result = {
    tutors,
    pagination: {
      total,
      page: filters.page,
      limit: filters.limit,
      pages: Math.ceil(total / filters.limit),
    },
  };

  await cache.set(cacheKey, result, config.cacheTtl.tutorSearch);
  return result;
};

const updateAvailability = async (user_id, availability) => {
  const profile = await tutorRepo.updateAvailability(user_id, availability);
  if (!profile) throw new AppError('Profile not found', 404);
  await cache.delByPattern(`${CACHE_PREFIX}*`);
  return profile;
};

const updateAvatar = async (user_id, avatarUrl) => {
  if (!avatarUrl) throw new AppError('Avatar URL is required', 400);
  
  const user = await userRepo.updateById(user_id, { avatar: avatarUrl });
  if (!user) throw new AppError('User not found', 404);
  
  return user;
};

module.exports = { upsertProfile, getMyProfile, getTutorById, searchTutors, updateAvailability, updateAvatar };
