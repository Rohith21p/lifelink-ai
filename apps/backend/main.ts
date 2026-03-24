app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://lifelink-ai.vercel.app'
  ],
  credentials: true,
});
