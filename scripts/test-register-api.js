async function testRegisterAPI() {
  try {
    console.log('Testing register API...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        name: 'New User',
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
    console.error('Error testing register API:', error);
  }
}

testRegisterAPI();