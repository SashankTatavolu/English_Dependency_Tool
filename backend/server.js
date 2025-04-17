// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const tokensRoute = require('./routes/token');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/conllu-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

app.use('/api/tokens', tokensRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend is running on http://localhost:${PORT}`);
});
