import { PrismaClient } from "@prisma/client";
import { IPaymentProvider, PaymentData, PaymentResponse } from "../lib/interface";

const prisma = new PrismaClient();

export class PaymentService {
    constructor(private provider: IPaymentProvider) { }

    async processPayment(data: PaymentData): Promise<PaymentResponse> {
        await prisma.transaction.create({
            data: {
                provider: this.provider.constructor.name.replace('Service', ""),
                referenceId: data.referenceId,
                amount: data.amount,
                currency: data.currency,
                status: 'pending'
            }
        });

        const result = await this.provider.initiatePayment(data);

        await prisma.transaction.update({
            where: { referenceId: data.referenceId },
            data: { status: result.status }
        });

        return result;
    }

    async verifyPayment(referenceId: string): Promise<PaymentResponse> {
        const result = await this.provider.verifyPayment(referenceId);

        await prisma.transaction.update({
            where: { referenceId },
            data: { status: result.status }
        });

        return result;
    }
}