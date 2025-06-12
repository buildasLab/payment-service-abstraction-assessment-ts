"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentService_1 = require("../PaymentService");
const paystack_1 = require("../paystack");
const flutterwave_1 = require("../flutterwave");
const router = (0, express_1.Router)();
// Initialize payment providers
const paystackService = new PaymentService_1.PaymentService(new paystack_1.PaystackService());
const flutterwaveService = new PaymentService_1.PaymentService(new flutterwave_1.FlutterwaveService());
// Initiate payment
router.post('/initiate', async (req, res) => {
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
});
// Verify payment
router.get('/verify/:referenceId', async (req, res) => {
    try {
        const { referenceId } = req.params;
        const { provider } = req.query;
        const service = provider === 'paystack' ? paystackService : flutterwaveService;
        const result = await service.verifyPayment(referenceId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'Failed to verify payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
