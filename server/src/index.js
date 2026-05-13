import express from 'express';
import morgan from 'morgan';
import { getStorageMeta, readDB, writeDB } from './data/store.js';
import { env } from './config/env.js';
import {
  configureCloudinary,
  createAllowedOrigins,
  createCorsMiddleware,
  createGoogleAuthClient,
  uploadImageToCloudinary,
} from './services/platform.js';
import { adminOnly } from './middleware/auth.js';
import { createCustomerOnly } from './middleware/customer.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerCatalogRoutes } from './routes/catalog.js';
import { registerCustomerRoutes } from './routes/customer.js';

const app = express();
const googleAuthClient = createGoogleAuthClient(env.GOOGLE_CLIENT_ID);
const allowedOrigins = createAllowedOrigins(env.CLIENT_URL);
const customerOnly = createCustomerOnly(readDB);

configureCloudinary(env.cloudinary, env.cloudinaryReady);

app.use(createCorsMiddleware(allowedOrigins));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.json({ message: 'SAWAD API is running' });
});

app.get('/api/health', async (_, res) => {
  const storage = await getStorageMeta();
  res.json({ status: 'ok', service: 'sawad-api', storage });
});

registerAuthRoutes(app, {
  ADMIN_EMAIL: env.ADMIN_EMAIL,
  ADMIN_PASSWORD: env.ADMIN_PASSWORD,
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
  googleAuthClient,
  readDB,
  writeDB,
});

registerCatalogRoutes(app, {
  adminOnly,
  readDB,
  writeDB,
});

registerCustomerRoutes(app, {
  customerOnly,
  readDB,
  writeDB,
});

registerAdminRoutes(app, {
  adminOnly,
  cloudinaryFolder: env.CLOUDINARY_FOLDER,
  cloudinaryReady: env.cloudinaryReady,
  readDB,
  writeDB,
  uploadImageToCloudinary,
});

app.listen(env.PORT, env.HOST, async () => {
  const storage = await getStorageMeta().catch(() => ({ driver: 'unknown' }));
  console.log(`SAWAD API running on ${env.HOST}:${env.PORT}`);
  console.log(`Storage driver: ${storage.driver}`);
});
