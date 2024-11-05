import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

app.post('/api/claude', async (req, res) => {
  try {
    const response = await axios.post(API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to call Claude API' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));