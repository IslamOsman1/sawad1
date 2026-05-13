import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import { OAuth2Client } from 'google-auth-library';

export function createAllowedOrigins(clientUrl) {
  if (clientUrl === '*') return '*';
  return clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createCorsMiddleware(allowedOrigins) {
  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins === '*') {
        return callback(null, true);
      }

      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
  });
}

export function createGoogleAuthClient(clientId) {
  return clientId ? new OAuth2Client(clientId) : null;
}

export function configureCloudinary(config, ready) {
  if (!ready) return;
  cloudinary.config(config);
}

export async function uploadImageToCloudinary(dataUri, folder) {
  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
}
