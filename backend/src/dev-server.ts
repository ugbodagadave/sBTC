// Development server
import app from './server';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`sBTCPay Development Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/v1`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});