"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = {
    FLUTTERWAVE_BASE_URL: process.env.FLUTTERWAVE_BASE_URL,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    CALLBACK_URL: process.env.callback_url
};
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});
const instance = (BASE_URL) => {
    return axios_1.default.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
class FlutterwaveService {
    constructor() {
        this.api = instance(process.env.FLUTTERWAVE_BASE_URL);
    }
    async initiatePayment(data) {
        try {
            const response = await this.api.post('/v3/charges', {
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
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                },
            });
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
        }
        catch (error) {
            console.error('Flutterwave payment initiation error:', error);
            return {
                status: 'failed',
                referenceId: data.referenceId,
                provider: 'Flutterwave',
                message: error instanceof Error ? error.message : 'Failed to initiate payment'
            };
        }
    }
    async verifyPayment(referenceId) {
        try {
            const response = await this.api.get(`/v3/transactions/${referenceId}/verify`, {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                },
            });
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
        }
        catch (error) {
            console.error('Flutterwave payment verification error:', error);
            return {
                status: 'failed',
                referenceId,
                provider: 'Flutterwave',
                message: error instanceof Error ? error.message : 'Failed to verify payment'
            };
        }
    }
}
exports.FlutterwaveService = FlutterwaveService;
