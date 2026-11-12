import { env } from '../config/env.js';
import { app } from './app.js';

app.listen(env.port, '127.0.0.1', () => {
  console.log(`API de AutoTaller Pro escuchando en http://localhost:${env.port}`);
});
