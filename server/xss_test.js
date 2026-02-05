const http = require('http');

const request = (options, data = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
            });
        });
        req.on('error', (err) => reject(err));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

async function xssTest() {
    try {
        // 1. Login as admin to get token
        const loginRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@intellisync.io',
            password: 'admin123'
        });

        const token = loginRes.token;
        console.log('Admin logged in.');

        // 2. Inject XSS payload into a blog post
        // The backend sanitizeInput removes <script>... but what about event handlers?
        const xssPayload = 'Test content <img src=x onerror=alert(1)> <a href="javascript:alert(2)">Click me</a>';

        // Also try bypasses for the tag removal regex
        const bypassPayload = '<scr<script>ipt>alert(3)</scr</script>ipt>';

        const blogRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/blogs', // Wait, actual endpoint is in index.js
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, {
            title: 'XSS Test Blog',
            content: xssPayload,
            excerpt: bypassPayload,
            author: 'Attacker',
            category: 'Security',
            tags: ['xss']
        });

        console.log('Blog Creation Result:', JSON.stringify(blogRes, null, 2));

    } catch (error) {
        console.error('XSS Test Error:', error);
    }
}

xssTest();
