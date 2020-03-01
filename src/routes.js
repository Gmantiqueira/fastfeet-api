import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';

import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import ProblemController from './app/controllers/ProblemController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import DispatchController from './app/controllers/DispatchController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/login', SessionController.store);

routes.use(authMiddleware);

routes.get('/recipient', RecipientController.index);
routes.post('/recipient', RecipientController.store);
routes.put('/recipient/:recipientId', RecipientController.update);
routes.delete('/recipient/:recipientId', RecipientController.delete);

routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:deliverymanId', DeliverymanController.update);
routes.delete('/deliveryman/:deliverymanId', DeliverymanController.delete);

routes.get('/delivery', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:deliveryId', DeliveryController.update);
routes.delete('/delivery/:deliveryId', DeliveryController.delete);

routes.get(
  '/deliveryman/:deliverymanId/deliveries',
  DispatchController.pending
);

routes.get('/delivery/:deliveryId/problems', ProblemController.index);
routes.post('/delivery/:deliveryId/problems', ProblemController.store);
routes.post('/problem/:deliveryId/cancel-delivery', ProblemController.cancel);

routes.put('/delivery/:deliveryId/withdraw', DispatchController.start);
routes.put('/delivery/:deliveryId/finish', DispatchController.end);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
