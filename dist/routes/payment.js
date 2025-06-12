"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.post('/initiate', controllers_1.initiatePayment);
router.get('/verify/:referenceId', controllers_1.verifyPayment);
exports.paymentRoutes = router;
