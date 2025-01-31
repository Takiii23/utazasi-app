<!-- payment.ejs -->
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('<YOUR_PUBLISHABLE_KEY>');
    const form = document.getElementById('payment-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const amount = document.getElementById('amount').value;

        // Request paymentIntent from server
        const { clientSecret } = await fetch('/stripe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    }).then((res) => res.json());

        const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
        card: cardElement,  // cardElement is Stripe's element that holds the card info
        billing_details: { name: 'Test User' } // collect user info dynamically
    }
    });

        if (error) {
        alert(error.message);
    } else {
        // Payment was successful
        alert("Payment Successful!");
    }
    });
</script>
