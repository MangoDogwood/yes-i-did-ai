import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

app.post('/api/claude', async (req, res) => {
  console.log('Received request to proxy server');
  try {
    const response = await axios.post(API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    console.log('Successful response from Claude API');
    res.json(response.data);
  } catch (error) {
    console.error('Error in proxy server:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || 'An error occurred' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));