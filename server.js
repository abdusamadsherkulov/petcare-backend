const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

const app = express();

dotenv.config();
connectDB();

// ✅ Enable CORS BEFORE routes
app.use(cors());

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);

// ✅ Example test route
app.get('/api/test', (req, res) => {
  res.json({message: 'CORS is enabled!'});
});

// ✅ Start server (ONLY ONCE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
