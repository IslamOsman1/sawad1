import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  HOST: process.env.HOST || '0.0.0.0',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@sawad.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '123456',
  CLIENT_URL: process.env.CLIENT_URL || '*',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'sawad/products',
  cloudinaryReady: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  ),
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
