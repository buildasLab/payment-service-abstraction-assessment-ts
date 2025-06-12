import { Router, Request, Response, RequestHandler } from 'express';
import { initiatePayment, verifyPayment } from '../controllers';

const router = Router();

router.post('/initiate', initiatePayment);
router.get('/verify/:referenceId', verifyPayment);

export const paymentRoutes = router;
