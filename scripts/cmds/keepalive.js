/**
 * Keep-Alive Server
 * -----------------
 * A simple Express.js server to keep your bot alive.
 *
 * Author: Gtajisan
 * License: MIT
 * Created: 2025
 * 
 * © 2025 Gtajisan. All rights reserved.
 */

const express = require('express');
const app = express();

// Configuration
const PORT = process.env.PORT || 8000;
const APP_NAME = "Gtajisan Keep-Alive Server";

// Root route
app.get('/', (req, res) => {
  res.status(200).send(`✅ ${APP_NAME} is running and alive!`);
});

// Healthcheck route (for uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    message: 'Bot is healthy 🚀'
  });
});

// Status route (detailed bot info)
app.get('/status', (req, res) => {
  res.status(200).json({
    app: APP_NAME,
    author: "Gtajisan",
    version: "1.0.0",
    license: "MIT",
    github: "https://github.com/Gtajisan",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found ❌' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ ${APP_NAME} is running on port ${PORT}`);
});
    
