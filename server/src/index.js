import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function startServer() {
  await connectDB();

  let port = Number(ENV.PORT) || 5001;

  const server = app.listen(port, () => {
    console.log(`Server running in ${ENV.NODE_ENV} mode on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} in use. Retrying on port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`Server running in ${ENV.NODE_ENV} mode on http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });

  const shutdown = async () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

export default app;
