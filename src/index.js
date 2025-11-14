const app = require('./app');
const config = require('./config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running in ${config.env} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/api/${config.apiVersion}`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
