const http = require('http');

const request = (options, data = null, headers = {}) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsedBody = {};
                try {
                    parsedBody = body ? JSON.parse(body) : {};
                } catch (e) {
                    parsedBody = { raw: body };
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsedBody
                });
            });
        });
        req.on('error', (err) => reject(err));
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
};

async function runAuditTests() {
    try {
        console.log('--- AUDIT: Testing Path Traversal ---');
        const traversalRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/pages/..%2f..%2fpackage.json',
            method: 'GET'
        });
        console.log('Path Traversal Result:', traversalRes.statusCode, traversalRes.body.error || 'No error');

        console.log('\n--- AUDIT: Testing Large Payload (DoS) ---');
        const largeName = 'A'.repeat(1024 * 1024); // 1MB name
        const dosRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'dos@example.com',
            password: 'password123',
            name: largeName
        });
        console.log('DoS Payload Result:', dosRes.statusCode, dosRes.body.error || 'No error');

        console.log('\n--- AUDIT: Testing Weak JWT Secret (Attempting to Forge) ---');
        // We already know the secret from the code: "your-super-secret-jwt-key-change-in-production"
        // Forging a token for userId 'admin' if we can find one.
        // This is more of a manual proof, but we can verify if the secret is actually used.

        console.log('\n--- AUDIT: Testing Exposed Health Info ---');
        const healthRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/health',
            method: 'GET'
        });
        console.log('Health Check Disclosure:', JSON.stringify(healthRes.body.memory, null, 2));

        console.log('\n--- AUDIT: IDOR Check ---');
        // First register a non-admin user
        const userRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'user@example.com',
            password: 'password123',
            name: 'Normal User'
        });

        if (userRes.body.token) {
            const userToken = userRes.body.token;
            // Try to access admin list
            const idorRes = await request({
                hostname: 'localhost',
                port: 5000,
                path: '/api/pages',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            console.log('IDOR (User accessing /api/pages) Status:', idorRes.statusCode);
            console.log('IDOR Response:', JSON.stringify(idorRes.body, null, 2));
        }

    } catch (error) {
        console.error('Audit Test Error:', error);
    }
}

runAuditTests();
