// Initialize Stripe (replace with your publishable key)
const stripe = Stripe('pk_test_your_actual_stripe_publishable_key_here');

// Configuration
const CONFIG = {
    // Replace with your actual API keys and endpoints
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_actual_stripe_publishable_key_here',
    DYNADOT_API_KEY: 'your_dynadot_api_key_here',
    DYNADOT_API_URL: 'https://api.dynadot.com/api3.json',
    BACKEND_URL: 'https://packie-designs.onrender.com/api', // Your backend for handling payments
    COMMISSION_RATE: 0.15 // 15% commission on domain sales
};

// Pricing configuration
const PRICING = {
    basic: {
        name: 'Basic Website',
        price: 2500,
        type: 'one-time'
    },
    professional: {
        name: 'Professional Website',
        price: 3500,
        type: 'one-time'
    },
    premium: {
        name: 'Premium Website',
        price: 4500,
        type: 'one-time'
    },
    'basic-maintenance': {
        name: 'Basic Maintenance',
        price: 150,
        type: 'monthly'
    },
    'premium-maintenance': {
        name: 'Premium Maintenance',
        price: 300,
        type: 'monthly'
    }
};

// DOM Elements
const paymentModal = document.getElementById('paymentModal');
const domainModal = document.getElementById('domainModal');
const paymentForm = document.getElementById('paymentForm');
const domainResults = document.getElementById('domainResults');
const domainNameInput = document.getElementById('domainName');
const checkDomainBtn = document.getElementById('checkDomain');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePricingButtons();
    initializeContactForm();
    initializeModals();
    initializeDomainSearch();
    initializePortfolioImages();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

// Pricing buttons functionality
function initializePricingButtons() {
    document.querySelectorAll('.pricing-btn, .maintenance-btn').forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            if (plan) {
                openPaymentModal(plan);
            }
        });
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            alert('Thank you for your message! I\'ll get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Modal functionality
function initializeModals() {
    // Close modals when clicking the X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Portfolio images functionality
function initializePortfolioImages() {
    const portfolioImages = document.querySelectorAll('.portfolio-image img');
    
    portfolioImages.forEach(img => {
        // Check if image loads successfully
        img.addEventListener('load', function() {
            this.parentElement.classList.remove('show-fallback');
        });
        
        img.addEventListener('error', function() {
            this.style.display = 'none';
            this.parentElement.classList.add('show-fallback');
        });
        
        // If image src is empty or invalid, show fallback immediately
        if (!img.src || img.src.includes('placeholder') || img.src.endsWith('.jpg') && !img.complete) {
            img.style.display = 'none';
            img.parentElement.classList.add('show-fallback');
        }
    });
}

// Domain search functionality
function initializeDomainSearch() {
    checkDomainBtn.addEventListener('click', function() {
        const domainName = domainNameInput.value.trim();
        
        if (!domainName) {
            alert('Please enter a domain name');
            return;
        }
        
        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domainName)) {
            alert('Please enter a valid domain name (e.g., example.com)');
            return;
        }
        
        checkDomainAvailability(domainName);
    });
    
    // Allow Enter key to trigger domain check
    domainNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkDomainBtn.click();
        }
    });
}

// Check domain availability using Dynadot API
async function checkDomainAvailability(domainName) {
    const resultsDiv = domainResults;
    resultsDiv.innerHTML = '<div class="loading">Checking availability...</div>';
    
    try {
        // Note: In a real implementation, you would make this call from your backend
        // to keep your API key secure
        const response = await fetch(`${CONFIG.BACKEND_URL}/check-domain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain: domainName,
                apiKey: CONFIG.DYNADOT_API_KEY
            })
        });
        
        const data = await response.json();
        displayDomainResults(data);
        
    } catch (error) {
        console.error('Error checking domain:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <p>Error checking domain availability. Please try again.</p>
                <p>Note: This is a demo. In production, you would need to set up a backend to handle the Dynadot API calls.</p>
            </div>
        `;
    }
}

// Display domain search results
function displayDomainResults(data) {
    const resultsDiv = domainResults;
    
    if (data.available) {
        const price = data.price || 12.99; // Default price if not provided
        const commission = (price * CONFIG.COMMISSION_RATE).toFixed(2);
        
        resultsDiv.innerHTML = `
            <div class="domain-result available">
                <h4>✅ ${data.domain} is available!</h4>
                <div class="domain-details">
                    <p><strong>Price:</strong> $${price}/year</p>
                    <p><strong>Your Commission:</strong> $${commission}</p>
                    <p><strong>Total Cost:</strong> $${(parseFloat(price) + parseFloat(commission)).toFixed(2)}</p>
                </div>
                <button class="btn btn-primary" onclick="purchaseDomain('${data.domain}', ${price})">
                    Purchase Domain
                </button>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="domain-result unavailable">
                <h4>❌ ${data.domain} is not available</h4>
                <p>This domain is already registered. Try searching for a different domain name.</p>
            </div>
        `;
    }
}

// Purchase domain
async function purchaseDomain(domainName, price) {
    try {
        // Create a payment intent for domain purchase
        const response = await fetch(`${CONFIG.BACKEND_URL}/create-domain-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain: domainName,
                price: price,
                commission: price * CONFIG.COMMISSION_RATE
            })
        });
        
        const { clientSecret } = await response.json();
        
        // Confirm payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success.html`,
            },
        });
        
        if (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Error purchasing domain:', error);
        alert('Error purchasing domain. Please try again.');
    }
}

// Open payment modal
function openPaymentModal(planKey) {
    const plan = PRICING[planKey];
    if (!plan) {
        console.error('Invalid plan:', planKey);
        return;
    }
    
    paymentModal.style.display = 'block';
    
    // Create payment form based on plan type
    if (plan.type === 'one-time') {
        createOneTimePaymentForm(plan);
    } else {
        createSubscriptionForm(plan);
    }
}

// Create one-time payment form
function createOneTimePaymentForm(plan) {
    paymentForm.innerHTML = `
        <div class="payment-plan-info">
            <h3>${plan.name}</h3>
            <div class="price-display">
                <span class="currency">$</span>
                <span class="amount">${plan.price.toLocaleString()}</span>
                <span class="period">one-time</span>
            </div>
        </div>
        
        <form id="payment-form">
            <div class="form-group">
                <label for="customer-name">Full Name</label>
                <input type="text" id="customer-name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="customer-email">Email</label>
                <input type="email" id="customer-email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="customer-phone">Phone Number</label>
                <input type="tel" id="customer-phone" name="phone">
            </div>
            
            <div class="form-group">
                <label for="project-details">Project Details</label>
                <textarea id="project-details" name="projectDetails" rows="4" 
                    placeholder="Tell me about your project requirements..."></textarea>
            </div>
            
            <div id="payment-element">
                <!-- Stripe Elements will be inserted here -->
            </div>
            
            <button type="submit" id="submit-payment" class="btn btn-primary">
                Pay $${plan.price.toLocaleString()}
            </button>
        </form>
    `;
    
    initializeStripeElements(plan);
}

// Create subscription form
function createSubscriptionForm(plan) {
    paymentForm.innerHTML = `
        <div class="payment-plan-info">
            <h3>${plan.name}</h3>
            <div class="price-display">
                <span class="currency">$</span>
                <span class="amount">${plan.price}</span>
                <span class="period">/month</span>
            </div>
        </div>
        
        <form id="subscription-form">
            <div class="form-group">
                <label for="customer-name">Full Name</label>
                <input type="text" id="customer-name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="customer-email">Email</label>
                <input type="email" id="customer-email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="customer-phone">Phone Number</label>
                <input type="tel" id="customer-phone" name="phone">
            </div>
            
            <div class="form-group">
                <label for="website-url">Website URL (if applicable)</label>
                <input type="url" id="website-url" name="websiteUrl" 
                    placeholder="https://yourwebsite.com">
            </div>
            
            <div id="payment-element">
                <!-- Stripe Elements will be inserted here -->
            </div>
            
            <button type="submit" id="submit-subscription" class="btn btn-primary">
                Subscribe for $${plan.price}/month
            </button>
        </form>
    `;
    
    initializeStripeSubscription(plan);
}

// Initialize Stripe Elements for one-time payments
async function initializeStripeElements(plan) {
    try {
        // Create payment intent on your backend
        const response = await fetch(`${CONFIG.BACKEND_URL}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: plan.price * 100, // Convert to cents
                currency: 'usd',
                plan: plan.name
            })
        });
        
        const { clientSecret } = await response.json();
        
        // Create Stripe Elements
        const elements = stripe.elements({
            clientSecret: clientSecret
        });
        
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        // Handle form submission
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const submitButton = document.getElementById('submit-payment');
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/success.html`,
                },
            });
            
            if (error) {
                console.error('Payment failed:', error);
                alert('Payment failed. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = `Pay $${plan.price.toLocaleString()}`;
            }
        });
        
    } catch (error) {
        console.error('Error initializing payment:', error);
        paymentForm.innerHTML = `
            <div class="error">
                <p>Error initializing payment. Please try again.</p>
                <p>Note: This is a demo. In production, you would need to set up a backend to handle Stripe payments.</p>
            </div>
        `;
    }
}

// Initialize Stripe subscription
async function initializeStripeSubscription(plan) {
    try {
        // Create subscription on your backend
        const response = await fetch(`${CONFIG.BACKEND_URL}/create-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price: plan.price * 100, // Convert to cents
                currency: 'usd',
                plan: plan.name
            })
        });
        
        const { clientSecret } = await response.json();
        
        // Create Stripe Elements
        const elements = stripe.elements({
            clientSecret: clientSecret
        });
        
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        // Handle form submission
        const form = document.getElementById('subscription-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const submitButton = document.getElementById('submit-subscription');
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/success.html`,
                },
            });
            
            if (error) {
                console.error('Subscription failed:', error);
                alert('Subscription failed. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = `Subscribe for $${plan.price}/month`;
            }
        });
        
    } catch (error) {
        console.error('Error initializing subscription:', error);
        paymentForm.innerHTML = `
            <div class="error">
                <p>Error initializing subscription. Please try again.</p>
                <p>Note: This is a demo. In production, you would need to set up a backend to handle Stripe subscriptions.</p>
            </div>
        `;
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .domain-result {
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    
    .domain-result.available {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
    }
    
    .domain-result.unavailable {
        background: #fef2f2;
        border: 1px solid #fecaca;
    }
    
    .domain-details {
        margin: 1rem 0;
    }
    
    .domain-details p {
        margin: 0.5rem 0;
    }
    
    .payment-plan-info {
        text-align: center;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f8fafc;
        border-radius: 8px;
    }
    
    .price-display {
        margin-top: 1rem;
    }
    
    .error {
        color: #ef4444;
        text-align: center;
        padding: 1rem;
    }
`;
document.head.appendChild(style);
