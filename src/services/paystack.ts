import axios from 'axios';
import dotenv from 'dotenv';
import { IPaymentProvider, PaymentData, PaymentResponse } from '../lib/interface';

dotenv.config();

const instance = (BASE_URL: string) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export class PaystackService implements IPaymentProvider {
    private readonly api = instance(process.env.PAYSTACK_BASE_URL as string);

    async initiatePayment(data: PaymentData): Promise<PaymentResponse> {
        try {
            const response = await this.api.post(
                '/transaction/initialize',
                {
                    amount: data.amount * 100,
                    email: data.email,
                    reference: data.referenceId,
                    callback_url: `${process.env.CALLBACK_URL}/payments/verify`,
                    currency: data.currency,
                },
                {
                    headers: {
                        authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                }
            );

            if (response.data.status) {
                return {
                    status: 'pending',
                    referenceId: data.referenceId,
                    provider: 'Paystack',
                    message: 'Payment initiated successfully',
                    paymentLink: response.data.data.authorization_url
                };
            }

            throw new Error(response.data.message || 'Failed to initialize payment');
        } catch (error) {
            console.error('Paystack payment initiation error:', error);
            return {
                status: 'failed',
                referenceId: data.referenceId,
                provider: 'Paystack',
                message: error instanceof Error ? error.message : 'Failed to initiate payment'
            };
        }
    }

    async verifyPayment(referenceId: string): Promise<PaymentResponse> {
        try {
            const response = await this.api.get(
                `/transaction/verify/${referenceId}`,
                {
                    headers: {
                        authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                }
            );

            if (!response.data.status) {
                throw new Error(response.data.message || 'Transaction not found');
            }

            const transaction = response.data.data;
            let status: 'pending' | 'success' | 'failed';

            switch (transaction.status) {
                case 'success':
                    status = 'success';
                    break;
                case 'failed':
                    status = 'failed';
                    break;
                default:
                    status = 'pending';
            }

            return {
                status,
                referenceId,
                provider: 'Paystack',
                message: status === 'success'
                    ? 'Payment verified successfully'
                    : status === 'pending'
                        ? 'Payment is pending'
                        : 'Payment verification failed'
            };
        } catch (error) {
            console.error('Paystack payment verification error:', error);
            return {
                status: 'failed',
                referenceId,
                provider: 'Paystack',
                message: error instanceof Error ? error.message : 'Failed to verify payment'
            };
        }
    }
}