const http = require('http');

const request = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: body ? JSON.parse(body) : {}
      }));
    });
    req.on('error', (err) => reject(err));
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  try {
    console.log('--- Registering User ---');
    const registerRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@intellisync.io',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });
    console.log('Register Status:', registerRes.statusCode);
    console.log('Register Body:', JSON.stringify(registerRes.body, null, 2));

    console.log('\n--- Logging In ---');
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
    console.log('Login Status:', loginRes.statusCode);
    console.log('Login Body:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.body.token) {
      const token = loginRes.body.token;
      console.log('\n--- Accessing Admin Data (With Token) ---');
      const adminRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/pages',
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Admin Data Status:', adminRes.statusCode);
      console.log('Admin Data Body:', JSON.stringify(adminRes.body, null, 2));
    }

  } catch (error) {
    console.error('Test Error:', error);
  }
}

runTests();
