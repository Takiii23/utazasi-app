document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
    const form = document.getElementById('payment-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const amount = document.getElementById('amount').value;

        // Stripe Payment
        const response = await fetch('/stripe-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        const { clientSecret } = await response.json();
        const { error } = await stripe.confirmCardPayment(clientSecret);

        if (error) {
            alert('Hiba a Stripe fizetés során: ' + error.message);
        } else {
            alert('Fizetés sikeres!');
        }
    });

    // PayPal Payment
    paypal.Buttons({
        createOrder: function() {
            return fetch('/paypal-payment', {
                method: 'POST'
            }).then((res) => res.json()).then((data) => data.id);
        },
        onApprove: function(data) {
            alert('PayPal fizetés sikeres! Rendelési ID: ' + data.orderID);
        }
    }).render('#paypal-button-container');
});
