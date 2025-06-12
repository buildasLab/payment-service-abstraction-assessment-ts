// Entry point for demonstration
import PaymentService from './services/PaymentService';

const payment = new PaymentService('paystack');
payment.initiatePayment({ amount: 5000, email: 'test@example.com' });