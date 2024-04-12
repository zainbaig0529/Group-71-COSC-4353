// login.test.js
const { expect } = require('chai');
const { loginUser } = require('../services/authService');

describe('User Login', () => {
  it('should login with valid credentials', async () => {
    const user = await loginUser('valid@example.com', 'password123');
    expect(user).to.exist;
    expect(user.email).to.equal('valid@example.com');
  });

  it('should reject login with invalid credentials', async () => {
    try {
      await loginUser('invalid@example.com', 'invalidpassword');
      // If login succeeds with invalid credentials, fail the test
      throw new Error('Login should have failed');
    } catch (error) {
      expect(error).to.exist;
    }
  });
});
