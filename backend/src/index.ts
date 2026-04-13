import { createServer } from 'http';
import { env } from './config/env';
import { createApp } from './api/server';
import { createWebSocketServer } from './websocket/server';
import { setIO } from './lib/io';
import { WhatsAppService } from './services/whatsapp.service';

async function main() {
  const app = createApp();
  const httpServer = createServer(app);
  const io = createWebSocketServer(httpServer);

  setIO(io);
  await WhatsAppService.init();

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

main().catch(console.error);
