// registration.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const expect = chai.expect;
  
    describe('Registration Tests', () => {
      it('should register a new user with valid information', () => {
        const result = registerUser('test@example.com', 'password123');
        expect(result).to.exist;
      });
  
    });
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });
  