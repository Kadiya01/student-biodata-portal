import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  cloudinaryUrl: process.env.CLOUDINARY_URL || ''
};

export default config;
