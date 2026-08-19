/**
 * Local dev server entry point. Not used by Vercel (see api/index.ts).
 */
import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Barber-Shop API en http://localhost:${env.PORT}`);
});