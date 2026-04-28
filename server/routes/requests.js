const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// 1. Submit a Request
router.post('/submit', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.json({ msg: "Request Submitted Successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get User's Requests (for Tracking)
router.get('/user/:userId', async (req, res) => {
  const requests = await Request.find({ userId: req.params.userId });
  res.json(requests);
});

module.exports = router;