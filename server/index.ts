import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import { pandalRoutes } from './routes/pandals.js';
import { foodRoutes } from './routes/food.js';
import { nearbyRoutes } from './routes/nearby.js';
import { navigateRoutes } from './routes/navigate.js';
import { startDecayWorker } from './lib/trending.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// --- Middleware ---
await server.register(cors, { origin: '*' });
await server.register(compress, { global: true });

// --- Global error handler ---
server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);
  const statusCode = error.statusCode ?? 500;
  reply.status(statusCode).send({
    error: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred',
    statusCode,
  });
});

// --- Health check ---
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// --- API Routes ---
await server.register(pandalRoutes);
await server.register(foodRoutes);
await server.register(nearbyRoutes);
await server.register(navigateRoutes);

// --- Serve Frontend Static Files ---
const distPath = path.join(__dirname, '../dist');
await server.register(fastifyStatic, {
  root: distPath,
  prefix: '/',
  wildcard: false, // Let us handle wildcard for SPA fallback
});

// SPA Fallback: Any unmatched route that doesn't start with /api returns index.html
server.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api')) {
    reply.status(404).send({ error: 'Not Found', message: 'API route not found' });
  } else {
    reply.sendFile('index.html', distPath);
  }
});

// --- Start trending decay worker ---
startDecayWorker();

// --- Boot ---
const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await server.listen({ port, host });
    console.log(`\n🚀 Pujo Pathfinder API running at http://${host}:${port}`);
    console.log(`   Health: http://localhost:${port}/health`);
    console.log(`   Pandals: http://localhost:${port}/api/pandals`);
    console.log(`   Food: http://localhost:${port}/api/food`);
    console.log(`   Nearby: http://localhost:${port}/api/nearby?lat=22.57&lng=88.36&r=2000`);
    console.log(`   Trending: http://localhost:${port}/api/trending\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
