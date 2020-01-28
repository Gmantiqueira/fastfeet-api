import { Router } from 'express';

import UserController from './app/controllers/UserController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/users', UserController.index);

routes.use(authMiddleware);

export default routes;
