// registration.test.js
const { expect } = require('chai');
const { registerUser } = require('../services/authService');

describe('User Registration', () => {
  it('should register a new user', async () => {
    const user = await registerUser('newuser@example.com', 'password123');
    expect(user).to.exist;
    expect(user.email).to.equal('newuser@example.com');
  });

  it('should reject registration with invalid email', async () => {
    try {
      await registerUser('invalidemail', 'password123');
      // If registration succeeds with invalid email, fail the test
      throw new Error('Registration should have failed');
    } catch (error) {
      expect(error).to.exist;
    }
  });
});