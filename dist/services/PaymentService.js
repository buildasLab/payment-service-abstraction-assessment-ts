"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PaymentService {
    constructor(provider) {
        this.provider = provider;
    }
    async processPayment(data) {
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
    async verifyPayment(referenceId) {
        const result = await this.provider.verifyPayment(referenceId);
        await prisma.transaction.update({
            where: { referenceId },
            data: { status: result.status }
        });
        return result;
    }
}
exports.PaymentService = PaymentService;
