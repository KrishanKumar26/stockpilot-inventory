const express = require('express');
const router = express.Router();
const { askAICopilot } = require('../controllers/aiController');

router.post('/copilot', askAICopilot);

module.exports = router;
