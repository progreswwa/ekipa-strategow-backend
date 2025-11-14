const app = require('./app');
const config = require('./config');
const database = require('./config/database');

const PORT = config.port;

/**
 * Initialize database and start server
 */
async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await database.testConnection();
    
    if (dbConnected) {
      // Initialize database tables
      console.log('📊 Initializing database tables...');
      await database.initDatabase();
    } else {
      console.warn('⚠️  Database not connected. Server will start but database operations will fail.');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running in ${config.env} mode`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌐 API endpoint: http://localhost:${PORT}/api`);
      console.log('=================================');
      console.log('Available endpoints:');
      console.log('  POST   /api/brief         - Submit new brief');
      console.log('  GET    /api/brief/:id     - Get brief by ID');
      console.log('  POST   /api/deploy        - Deploy website');
      console.log('  GET    /api/status/:jobId - Get job status');
      console.log('  GET    /api/health        - Health check');
      console.log('=================================');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connection pool
        await database.closePool();
        
        console.log('Graceful shutdown complete');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = { startServer };
