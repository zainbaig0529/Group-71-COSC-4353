// registration.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const { expect } = chai;
  
    // Your test code using chai goes here
  
    describe('User Registration', () => {
      it('should register a new user with valid input data', () => {
        // Your test code goes here
        // Example:
        const result = registerUser('test@example.com', 'password123');
        expect(result).to.exist;
        // Add more assertions as needed
      });
  
      // Add more test cases as needed
    });
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });
  