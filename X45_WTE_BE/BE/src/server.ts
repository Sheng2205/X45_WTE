import { app } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

const HOST = '0.0.0.0';
const PORT = env.port;

const start = async () => {
  // Listen on 0.0.0.0 immediately so Render port scanner detects the open port right away
  const server = app.listen(PORT, HOST, () => {
    console.log(`Backend server running at http://${HOST}:${PORT}`);
  });

  // Connect to MongoDB asynchronously without blocking the port scanner
  connectDb()
    .then(() => {
      console.log('MongoDB connected successfully.');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error?.message || error);
    });

  return server;
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
