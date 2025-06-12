"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Flutterwave {
    initiatePayment(data) {
        console.log('Initiating Flutterwave payment:', data);
    }
    verifyPayment(reference) {
        console.log('Verifying Flutterwave payment with reference:', reference);
    }
}
exports.default = Flutterwave;
