"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const paystackService = new services_1.PaymentService(new services_1.PaystackService());
const flutterwaveService = new services_1.PaymentService(new services_1.FlutterwaveService());
const initiatePayment = async (req, res) => {
    try {
        const { amount, email, provider, currency } = req.body;
        const referenceId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paymentData = {
            amount,
            email,
            referenceId,
            currency: currency || 'NGN'
        };
        const service = provider === 'paystack' ? paystackService : flutterwaveService;
        const result = await service.processPayment(paymentData);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'Failed to initiate payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
const verifyPayment = async (req, res) => {
    try {
        const { referenceId } = req.params;
        const { provider } = req.query;
        const transaction = await prisma.transaction.findUnique({
            where: { referenceId }
        });
        if (!transaction) {
            res.status(404).json({
                status: 'failed',
                message: 'Transaction not found'
            });
            return;
        }
        const service = provider === 'paystack' ? paystackService : flutterwaveService;
        const verificationResult = await service.verifyPayment(referenceId);
        res.json({
            transaction: {
                id: transaction.id,
                referenceId: transaction.referenceId,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                provider: transaction.provider,
                createdAt: transaction.createdAt
            },
            verification: verificationResult
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'Failed to verify payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
