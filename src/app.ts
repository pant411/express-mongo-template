import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import express from 'express';
import { NextFunction, Request, Response } from 'express';
import config from 'config';
import connectDB from './utils/connect-mongo';

const app = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    text: 'Hello World!!!'
  });
})

const port = config.get<number>('port');
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  connectDB();
});