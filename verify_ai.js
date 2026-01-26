const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/execute',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({
    agent_name: 'suggestion_agent',
    input_payload: {
        location: 'Paris',
        screen_type: 'mobile'
    }
}));

req.end();
