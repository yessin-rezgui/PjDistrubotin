const ConcertService = require('../services/ConcertService');

class ConcertController {
  async createConcert(req, res) {
    try {
      const concert = await ConcertService.createConcert(req.body);
      res.status(201).json({ success: true, data: concert });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getAllConcerts(req, res) {
    try {
      const concerts = await ConcertService.getAllConcerts();
      res.json({ success: true, data: concerts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getConcertById(req, res) {
    try {
      const concert = await ConcertService.getConcertById(req.params.id);
      if (!concert) return res.status(404).json({ success: false, message: 'Concert not found' });
      res.json({ success: true, data: concert });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSeats(req, res) {
    try {
      const seats = await ConcertService.getSeats(req.params.id);
      res.json({ success: true, data: seats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteConcert(req, res) {
    try {
      await ConcertService.deleteConcert(req.params.id);
      res.json({ success: true, message: 'Concert deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateConcert(req, res) {
    try {
      const concert = await ConcertService.updateConcert(req.params.id, req.body);
      res.json({ success: true, data: concert });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await ConcertService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ConcertController();
