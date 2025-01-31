import paypal from '@paypal/checkout-server-sdk';

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

export default paypalClient;
