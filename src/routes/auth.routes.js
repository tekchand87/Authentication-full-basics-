import {Router} from 'express';
import * as authController from '../controllers/auth.controller.js'
const authRouter = Router();

/**
 * -> POST api/auth/register
 */
authRouter.post('/register',authController.register)

/**
 * -> POST api/auth/login
 */
authRouter.post('/login',authController.login);

/**
 * -> get api/auth/get-me
 */
authRouter.get('/get-me',authController.getMe);


/**
 * -> get api/auth/refresh-token
 */
authRouter.get('/refresh-token',authController.refreshToken)

/**
 * -> Get api/auth/logout
 */
authRouter.get('/logout',authController.logout)

/**
 * -> get api/auth/logoutall
 */
authRouter.get('/logoutall',authController.logoutAll)

/**
 * -> get api/auth/verify-email
 */
authRouter.get('/verify-email',authController.verifyEmail)
export default authRouter;