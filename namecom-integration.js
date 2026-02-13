const axios = require('axios');

// Minimal Name.com integration helper (placeholders)
// Uses environment variables: NAMECOM_API_USERNAME and NAMECOM_API_TOKEN

const NAMECOM_API_BASE = 'https://api.name.com/v4';

async function checkDomainAvailability(domain) {
    // This function uses Name.com's lookup endpoint per docs.
    // Requires API key or token; here we attempt a simple GET using basic auth.
    try {
        const username = process.env.NAMECOM_API_USERNAME;
        const token = process.env.NAMECOM_API_TOKEN;

        if (!username || !token) {
            return { available: null, error: 'Name.com API credentials not configured' };
        }

        const url = `${NAMECOM_API_BASE}/domains:checkAvailability?domain=${encodeURIComponent(domain)}`;
        const resp = await axios.get(url, {
            auth: { username, password: token }
        });

        return resp.data;
    } catch (err) {
        return { available: null, error: err.message };
    }
}

async function registerDomain(domain, years = 1, contact = {}) {
    try {
        const username = process.env.NAMECOM_API_USERNAME;
        const token = process.env.NAMECOM_API_TOKEN;

        if (!username || !token) {
            throw new Error('Name.com API credentials not configured');
        }

        const url = `${NAMECOM_API_BASE}/domains`; // POST to create domain order per Name.com
        const body = {
            domain: domain,
            years: years,
            contact: contact
        };

        const resp = await axios.post(url, body, {
            auth: { username, password: token }
        });

        return resp.data;
    } catch (err) {
        return { error: err.message };
    }
}

// DNS helper functions (Name.com DNS automation)
async function listDomainRecords(domain) {
    try {
        const username = process.env.NAMECOM_API_USERNAME;
        const token = process.env.NAMECOM_API_TOKEN;
        if (!username || !token) return { error: 'Name.com API credentials not configured' };

        const url = `${NAMECOM_API_BASE}/domains/${encodeURIComponent(domain)}/records`;
        const resp = await axios.get(url, { auth: { username, password: token } });
        return resp.data;
    } catch (err) {
        return { error: err.message };
    }
}

async function createDomainRecord(domain, record) {
    try {
        const username = process.env.NAMECOM_API_USERNAME;
        const token = process.env.NAMECOM_API_TOKEN;
        if (!username || !token) return { error: 'Name.com API credentials not configured' };

        const url = `${NAMECOM_API_BASE}/domains/${encodeURIComponent(domain)}/records`;
        const resp = await axios.post(url, record, { auth: { username, password: token } });
        return resp.data;
    } catch (err) {
        return { error: err.message };
    }
}

async function deleteDomainRecord(domain, recordId) {
    try {
        const username = process.env.NAMECOM_API_USERNAME;
        const token = process.env.NAMECOM_API_TOKEN;
        if (!username || !token) return { error: 'Name.com API credentials not configured' };

        const url = `${NAMECOM_API_BASE}/domains/${encodeURIComponent(domain)}/records/${recordId}`;
        const resp = await axios.delete(url, { auth: { username, password: token } });
        return resp.data;
    } catch (err) {
        return { error: err.message };
    }
}

module.exports = { checkDomainAvailability, registerDomain, listDomainRecords, createDomainRecord, deleteDomainRecord };

module.exports = { checkDomainAvailability, registerDomain };
