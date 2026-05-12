const { Queue } = require('bullmq');
const redis = require('../config/redis');

const EMAIL_QUEUE = 'email';

const emailQueue = new Queue(EMAIL_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

/**
 * @param {string} type  - template key (e.g. 'registerOtp', 'bookingAccepted')
 * @param {string} to    - recipient email
 * @param {object} data  - template data
 */
const enqueueEmail = (type, to, data) => {
  emailQueue.add(type, { type, to, data }, { jobId: `${type}-${to}-${Date.now()}` });
  console.log('Email enqueued:', type, 'to:', to);
};

module.exports = { emailQueue, enqueueEmail, EMAIL_QUEUE };
