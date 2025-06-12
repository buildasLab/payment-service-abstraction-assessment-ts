interface PaymentData {
  amount: number;
  email: string;
}

export default class Flutterwave {
  initiatePayment(data: PaymentData): void {
    console.log('Initiating Flutterwave payment:', data);
  }

  verifyPayment(reference: string): void {
    console.log('Verifying Flutterwave payment with reference:', reference);
  }
}
