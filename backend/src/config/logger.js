const { createLogger, format, transports } = require('winston');
const { nodeEnv } = require('./env');

const logger = createLogger({
  level: nodeEnv === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} [${level}]: ${message}\n${stack}`
            : `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880, maxFiles: 5 }),
    new transports.File({ filename: 'logs/combined.log', maxsize: 5242880, maxFiles: 5 }),
  ],
});

module.exports = logger;
