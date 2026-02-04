import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://spreveen123:preveens@mini-store-erp.1jd7whk.mongodb.net/mini-store?appName=Mini-Store-ERP',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://mini-store-erp-app.onrender.com',
  },
};
