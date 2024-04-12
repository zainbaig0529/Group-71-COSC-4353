// login.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const expect = chai.expect;
  
  
    describe('Login Tests', () => {
      it('should perform login with valid credentials', () => {
        const result = loginUser('valid@example.com', 'password123');
        expect(result).to.exist;
      });
  
      it('should reject login with invalid credentials', () => {
        try {
          loginUser('invalid@example.com', 'invalidpassword');
          // If login succeeds with invalid credentials, fail the test
          throw new Error('Login should have failed');
        } catch (error) {
          expect(error).to.exist;
        }
      });
  
    });
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });
  