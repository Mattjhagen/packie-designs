const acme = require('acme-client');
const namecom = require('./namecom-integration');

// This module provides a helper to request a certificate via ACME using the DNS-01 challenge
// It requires working Name.com API credentials and a publicly resolvable domain.

async function obtainCertificate(domain, email) {
    if (!process.env.NAMECOM_API_USERNAME || !process.env.NAMECOM_API_TOKEN) {
        throw new Error('Name.com credentials not configured');
    }

    const client = new acme.Client({ directoryUrl: acme.directory.letsencrypt.staging, accountKey: await acme.forge.createPrivateKey() });

    const [key, csr] = await Promise.all([
        acme.forge.createPrivateKey(),
        (async () => {
            const privateKey = await acme.forge.createPrivateKey();
            const csr = await acme.forge.createCsr({ commonName: domain }, privateKey);
            return csr;
        })()
    ]);

    const order = await client.createOrder({ identifiers: [{ type: 'dns', value: domain }] });
    const authorizations = await client.getAuthorizations(order);

    for (const authz of authorizations) {
        const challenge = authz.challenges.find(c => c.type === 'dns-01');
        const keyAuth = await client.getChallengeKeyAuthorization(challenge);
        const dnsValue = acme.challenge.createDns01Record(keyAuth);

        // create TXT record via Name.com
        await namecom.createDomainRecord(domain, { type: 'TXT', host: `_acme-challenge`, answer: dnsValue, ttl: 300 });

        await client.verifyChallenge(authz, challenge);
        await client.completeChallenge(challenge);
        await client.waitForValidStatus(challenge);

        // cleanup - remove TXT record (best-effort)
        // Note: Name.com returns record id on creation; this helper ignores that for now.
    }

    await client.finalizeOrder(order, csr);
    const cert = await client.getCertificate(order);
    return { cert, key };
}

module.exports = { obtainCertificate };
