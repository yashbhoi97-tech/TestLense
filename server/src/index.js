import app from './app.js';
import { initSupabase, isUsingFallback } from './config/supabase.js';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

async function startServer() {
  try {
    initSupabase();

    const server = app.listen(PORT, HOST, () => {
      console.log(`====================================================`);
      console.log(`  TrustLense API Server Running`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Database: ${isUsingFallback() ? 'In-Memory Fallback Adapter' : 'Supabase PostgreSQL'}`);
      console.log(`  AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini Enabled' : 'Rules Fallback (Active)'}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal error starting TrustLense server:', err);
    process.exit(1);
  }
}

startServer();
