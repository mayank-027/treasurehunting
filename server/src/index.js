import { createServer } from './server.js';
import { connectToDatabase } from './config/db.js';
import env, { validateEnv } from './config/env.js';

const app = createServer();
validateEnv();
connectToDatabase()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server started on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });

