import { startWebSocketServer } from './trpc/adapter';

// Start the WebSocket server for tRPC subscriptions
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001;

console.log('🚀 Starting Grow Your Need SaaS Backend...');

// Start WebSocket server
startWebSocketServer(WS_PORT);

console.log('✅ Backend services initialized successfully!');
console.log(`📡 tRPC HTTP endpoints available at: /trpc/*`);
console.log(`🔌 tRPC WebSocket server running on port: ${WS_PORT}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});