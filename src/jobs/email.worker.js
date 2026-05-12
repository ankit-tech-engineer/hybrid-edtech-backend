const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const redis = require('../config/redis');
const config = require('../config');
const logger = require('../utils/logger');
const templates = require('../utils/templates/email.templates');
const { EMAIL_QUEUE } = require('./email.queue');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: { user: config.smtp.user, pass: config.smtp.pass },
});

const startEmailWorker = () => {
  const worker = new Worker(
    EMAIL_QUEUE,
    async (job) => {
      const { type, to, data } = job.data;

      const templateFn = templates[type];
      if (!templateFn) throw new Error(`Unknown email template: ${type}`);

      const { subject, html } = templateFn(data);

      const mailOptions = {
        from: `"Hybrid EdTech" <${config.smtp.user}>`,
        to,
        bcc: config.smtp.bcc || undefined,
        subject,
        html,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`[EMAIL] Sent "${type}" to ${to}`);
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[EMAIL] Job ${job.id} (${job.data.type}) failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`[EMAIL WORKER] ${err.message}`);
  });

  logger.info('[EMAIL WORKER] Started — listening for email jobs');
  return worker;
};

module.exports = { startEmailWorker };
