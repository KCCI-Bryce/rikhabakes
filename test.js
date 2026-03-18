fetch('http://127.0.0.1:8000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: "test_local_diag@test.com", password: "password123" })
}).then(r => r.json().then(data => console.log(r.status, data))).catch(console.error);
