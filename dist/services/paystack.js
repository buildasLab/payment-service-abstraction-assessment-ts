"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const instance = (BASE_URL) => {
    return axios_1.default.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
class PaystackService {
    constructor() {
        this.api = instance(process.env.PAYSTACK_BASE_URL);
    }
    async initiatePayment(data) {
        try {
            const response = await this.api.post('/transaction/initialize', {
                amount: data.amount * 100,
                email: data.email,
                reference: data.referenceId,
                callback_url: `${process.env.CALLBACK_URL}/payments/verify`,
                currency: data.currency,
            }, {
                headers: {
                    authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            });
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
        }
        catch (error) {
            console.error('Paystack payment initiation error:', error);
            return {
                status: 'failed',
                referenceId: data.referenceId,
                provider: 'Paystack',
                message: error instanceof Error ? error.message : 'Failed to initiate payment'
            };
        }
    }
    async verifyPayment(referenceId) {
        try {
            const response = await this.api.get(`/transaction/verify/${referenceId}`, {
                headers: {
                    authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            });
            if (!response.data.status) {
                throw new Error(response.data.message || 'Transaction not found');
            }
            const transaction = response.data.data;
            let status;
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
        }
        catch (error) {
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
exports.PaystackService = PaystackService;
