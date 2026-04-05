import { app } from './app';
import { config } from './config';

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API running on http://localhost:${config.port}`);
});
