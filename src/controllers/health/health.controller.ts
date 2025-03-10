import { Request, Response } from 'express';

export default class HealthController {
  static getHealth(req: Request, res: Response): any {
    res.send('OK!!');
  }
}
