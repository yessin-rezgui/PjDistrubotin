const cron = require('node-cron');
const TicketService = require('./TicketService');
const logger = require('../utils/logger');

class CronService {
  init(io) {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running ticket expiration cron job...');
      try {
        const expiredTickets = await TicketService.expireTickets();
        if (expiredTickets.length > 0) {
          logger.success(`Expired ${expiredTickets.length} tickets.`);
          if (io) {
            expiredTickets.forEach((ticket) => {
              io.emit('ticketStateChanged', {
                ...ticket,
                status: 'EXPIRED'
              });
            });
          }
        }
      } catch (err) {
        logger.error('Error in expiration cron job', err);
      }
    });
    
    logger.success('Cron services initialized.');
  }
}

module.exports = new CronService();
