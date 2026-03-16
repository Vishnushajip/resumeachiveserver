import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import { AppModule } from './app.module';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['error', 'warn'],
      bodyParser: false,
    },
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors();
  await app.init();
}
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Running on http://localhost:${PORT}`);
});

const ready = bootstrap();

export const api = onRequest(
  { memory: '512MiB', timeoutSeconds: 60, region: 'asia-south1' },
  async (req, res) => {
    await ready;
    server(req, res);
  },
);
