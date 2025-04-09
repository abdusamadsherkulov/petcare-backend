//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const petRoutes = require('./routes/petRoutes');
const axios = require('axios');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

dotenv.config();
connectDB();

// ✅ Enable CORS BEFORE routes
app.use(cors());

// ✅ Middleware to parse JSON requests
app.use(express.json());

// Proxy endpoint for images
app.get('/proxy-image', async (req, res) => {
  const {url} = req.query;
  try {
    const response = await axios.get(url, {responseType: 'arraybuffer'});
    const contentType = response.headers['content-type'] || 'image/jpeg'; // Default to JPEG if unspecified
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'no-cache'); // Prevent caching issues
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).send('Image proxy failed');
  }
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/cart', cartRoutes);

// ✅ Example test route
app.get('/api/test', (req, res) => {
  res.json({message: 'CORS is enabled!'});
});

// ✅ Start server (ONLY ONCE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
