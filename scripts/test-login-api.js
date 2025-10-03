async function testLoginAPI() {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response body:', data);
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

testLoginAPI();