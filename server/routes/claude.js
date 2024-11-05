const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/api/claude', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    res.json({ analysis: response.data.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to call Claude API' });
  }
});

module.exports = router;