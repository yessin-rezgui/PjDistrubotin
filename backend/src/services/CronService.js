const cron = require('node-cron');
const TicketService = require('./TicketService');

class CronService {
  init() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running ticket expiration cron job...');
      try {
        const expiredCount = await TicketService.expireTickets();
        if (expiredCount > 0) {
          console.log(`Expired ${expiredCount} tickets.`);
        }
      } catch (err) {
        console.error('Error in expiration cron job:', err);
      }
    });
    
    console.log('Cron services initialized.');
  }
}

module.exports = new CronService();
