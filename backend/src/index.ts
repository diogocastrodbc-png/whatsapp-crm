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

  const port = process.env.PORT || env.PORT;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);
