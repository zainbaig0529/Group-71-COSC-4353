const assert = require('assert');
const request = require('supertest');
const app = require('./app.js');  // Path to your Express application file

describe('POST /login.html', () => {
  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'invalid-email', password: 'validpassword' });
    assert.strictEqual(res.status, 400);
  });

  it('should return 400 if password is invalid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'valid@example.com', password: 'short' });
    assert.strictEqual(res.status, 400);
  });

  it('should return 200 if email and password are valid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'valid@example.com', password: 'validpassword' });
    assert.strictEqual(res.status, 200);
  });

  // Add more test cases as needed
});

  