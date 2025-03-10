import express, { Express } from 'express';
import 'dotenv/config';
import router from './routes/routes';

const PORT: string = process.env.PORT || '3000';
const app: Express = express();

app.use('/', router);

async function main(): Promise<void> {
  app.listen(PORT, () => {
    console.log(`Server is up over http://localhost:${PORT}`);
  });
}

main();
