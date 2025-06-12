export interface PaymentData {
    amount: number;
    email: string;
    referenceId: string;
    currency: string;
}

export interface PaymentResponse {
    status: 'pending' | 'success' | 'failed';
    referenceId: string;
    provider: string;
    message?: string;
    paymentLink?: string;
}

export interface IPaymentProvider {
    initiatePayment(data: PaymentData): Promise<PaymentResponse>;
    verifyPayment(referenceId: string): Promise<PaymentResponse>;
} 