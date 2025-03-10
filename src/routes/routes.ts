import { Router } from 'express';
import indexController from '../controllers/index.controller';

const router: Router = Router();

//Controllers
const isServerOK = indexController.HealthController;

//Routes Register
router.route('/health').get(isServerOK.getHealth);



export default router;
