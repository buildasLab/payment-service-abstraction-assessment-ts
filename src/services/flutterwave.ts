import axios from 'axios';
import dotenv from 'dotenv';
import { IPaymentProvider, PaymentData, PaymentResponse } from '../lib/interface';

dotenv.config();

const requiredEnvVars = {
    FLUTTERWAVE_BASE_URL: process.env.FLUTTERWAVE_BASE_URL,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    callback_url: process.env.callback_url
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

const instance = (BASE_URL: string) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export class FlutterwaveService implements IPaymentProvider {
    private readonly api = instance(process.env.FLUTTERWAVE_BASE_URL as string);

    async initiatePayment(data: PaymentData): Promise<PaymentResponse> {
        try {
            console.log('Initiating Flutterwave payment with data:', {
                amount: data.amount,
                email: data.email,
                referenceId: data.referenceId,
                currency: data.currency
            });

            const response = await this.api.post(
                '/v3/payments',
                {
                    amount: data.amount,
                    email: data.email,
                    tx_ref: data.referenceId,
                    currency: data.currency,
                    redirect_url: `${process.env.callback_url}/api/payments/verify`,
                    customer: {
                        email: data.email,
                    },
                    customizations: {
                        title: 'Payment',
                        description: 'Payment for services',
                    },
                    payment_options: 'card,banktransfer,ussd',
                    payment_type: 'card'
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    },
                }
            );

            console.log('Flutterwave API response:', response.data);

            if (response.data.status === 'success') {
                return {
                    status: 'pending',
                    referenceId: data.referenceId,
                    provider: 'Flutterwave',
                    message: 'Payment initiated successfully',
                    paymentLink: response.data.data.link
                };
            }

            throw new Error(response.data.message || 'Failed to initiate payment');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Flutterwave API error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            } else {
                console.error('Flutterwave payment initiation error:', error);
            }

            return {
                status: 'failed',
                referenceId: data.referenceId,
                provider: 'Flutterwave',
                message: error instanceof Error ? error.message : 'Failed to initiate payment'
            };
        }
    }

    async verifyPayment(referenceId: string): Promise<PaymentResponse> {
        try {
            const response = await this.api.get(
                `/v3/transactions/${referenceId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    },
                }
            );

            if (response.data.status === 'success') {
                const status = response.data.data.status === 'successful' ? 'success' : 'failed';
                return {
                    status,
                    referenceId,
                    provider: 'Flutterwave',
                    message: status === 'success' ? 'Payment verified successfully' : 'Payment verification failed'
                };
            }

            throw new Error(response.data.message || 'Failed to verify payment');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Flutterwave API error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            } else {
                console.error('Flutterwave payment verification error:', error);
            }

            return {
                status: 'failed',
                referenceId,
                provider: 'Flutterwave',
                message: error instanceof Error ? error.message : 'Failed to verify payment'
            };
        }
    }
}