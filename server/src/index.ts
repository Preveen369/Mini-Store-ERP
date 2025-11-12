import { createApp } from './app';
import { connectDatabase } from './config/database';
import { config } from './config';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Mini Store ERP Server Running 🚀     ║
╠════════════════════════════════════════╣
║ Environment: ${config.env.padEnd(24)}  ║
║ Port:        ${config.port.toString().padEnd(24)}  ║
║ API Base:    /api/v1                   ║
╚════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
