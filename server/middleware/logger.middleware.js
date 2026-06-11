import logger from './logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'guest',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    };

    if (res.statusCode >= 500) {
      logger.error('Server error', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', meta);
    } else {
      logger.info('Request', meta);
    }
  });

  next();
};
