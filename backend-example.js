// Backend API Example for Web Design Website
// This is a Node.js/Express example showing how to handle Stripe and Dynadot API integrations

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables (set these in your .env file)
const DYNADOT_API_KEY = process.env.DYNADOT_API_KEY;
const DYNADOT_API_URL = 'https://api.dynadot.com/api3.json';
const COMMISSION_RATE = 0.15; // 15% commission

// Stripe webhook endpoint (for handling successful payments)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Here you would typically:
            // 1. Update your database
            // 2. Send confirmation email
            // 3. Start the web design project
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Subscription payment succeeded:', invoice.id);
            // Handle successful subscription payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Create payment intent for one-time website payments
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', plan } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                plan: plan,
                type: 'website_design'
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Create subscription for monthly maintenance
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { price, currency = 'usd', plan } = req.body;

        // First, create a Stripe price if it doesn't exist
        const stripePrice = await stripe.prices.create({
            unit_amount: price,
            currency: currency,
            recurring: { interval: 'month' },
            product_data: {
                name: plan,
                description: `Monthly maintenance and hosting for ${plan}`
            }
        });

        // Create a setup intent for the subscription
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
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Check domain availability using Dynadot API
app.post('/api/check-domain', async (req, res) => {
    try {
        const { domain, apiKey } = req.body;

        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return res.status(400).json({ error: 'Invalid domain format' });
        }

        // Call Dynadot API to check availability
        const response = await axios.post(DYNADOT_API_URL, {
            key: apiKey,
            command: 'search',
            domain0: domain
        });

        const data = response.data;
        
        if (data.SearchResponse && data.SearchResponse.SearchResult) {
            const result = data.SearchResponse.SearchResult;
            const isAvailable = result.Available === 'yes';
            
            res.json({
                domain: domain,
                available: isAvailable,
                price: isAvailable ? parseFloat(result.Price) || 12.99 : null
            });
        } else {
            throw new Error('Invalid response from Dynadot API');
        }

    } catch (error) {
        console.error('Error checking domain:', error);
        res.status(500).json({ error: 'Failed to check domain availability' });
    }
});

// Create payment intent for domain purchase
app.post('/api/create-domain-payment', async (req, res) => {
    try {
        const { domain, price, commission } = req.body;
        const totalAmount = (price + commission) * 100; // Convert to cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            metadata: {
                domain: domain,
                domainPrice: price,
                commission: commission,
                type: 'domain_purchase'
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating domain payment intent:', error);
        res.status(500).json({ error: 'Failed to create domain payment intent' });
    }
});

// Purchase domain after successful payment
app.post('/api/purchase-domain', async (req, res) => {
    try {
        const { domain, paymentIntentId } = req.body;

        // Verify the payment was successful
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Call Dynadot API to purchase the domain
        const response = await axios.post(DYNADOT_API_URL, {
            key: DYNADOT_API_KEY,
            command: 'register',
            domain: domain,
            years: 1
        });

        if (response.data.RegisterResponse && response.data.RegisterResponse.RegisterResult) {
            const result = response.data.RegisterResponse.RegisterResult;
            
            if (result.Success === 'yes') {
                res.json({
                    success: true,
                    domain: domain,
                    orderId: result.OrderId
                });
            } else {
                res.status(400).json({ 
                    error: 'Domain purchase failed',
                    message: result.Message || 'Unknown error'
                });
            }
        } else {
            throw new Error('Invalid response from Dynadot API');
        }

    } catch (error) {
        console.error('Error purchasing domain:', error);
        res.status(500).json({ error: 'Failed to purchase domain' });
    }
});

// Get pricing information
app.get('/api/pricing', (req, res) => {
    const pricing = {
        website: {
            basic: { name: 'Basic Website', price: 2500, type: 'one-time' },
            professional: { name: 'Professional Website', price: 3500, type: 'one-time' },
            premium: { name: 'Premium Website', price: 4500, type: 'one-time' }
        },
        maintenance: {
            basic: { name: 'Basic Maintenance', price: 150, type: 'monthly' },
            premium: { name: 'Premium Maintenance', price: 300, type: 'monthly' }
        }
    };

    res.json(pricing);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
