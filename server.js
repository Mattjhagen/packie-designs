const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { checkDomainAvailability } = require('./dynadot-integration');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create payment intent for one-time payments
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', plan } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: currency,
            metadata: {
                plan: plan
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { price, currency = 'usd', plan } = req.body;
        
        // Create a price object for the subscription
        const stripePrice = await stripe.prices.create({
            unit_amount: price, // Amount in cents
            currency: currency,
            recurring: { interval: 'month' },
            product_data: {
                name: plan
            }
        });

        // Create a setup intent for subscription
        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            usage: 'off_session'
        });

        res.json({
            clientSecret: setupIntent.client_secret,
            priceId: stripePrice.id
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Handle successful payment
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Stripe payment server is running' });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Stripe payment server is running' });
});

// Check domain availability using Dynadot API
app.post('/api/check-domain', async (req, res) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain name is required' });
        }

        // Use the real Dynadot API integration
        const result = await checkDomainAvailability(domain);
        res.json(result);
        
    } catch (error) {
        console.error('Error checking domain:', error);
        res.status(500).json({ error: 'Error checking domain availability' });
    }
});

// Create domain purchase payment intent
app.post('/api/create-domain-payment', async (req, res) => {
    try {
        const { domain, price, currency = 'usd' } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price * 100), // Convert to cents
            currency: currency,
            metadata: {
                type: 'domain_purchase',
                domain: domain
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating domain payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
