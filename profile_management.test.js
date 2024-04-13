// profile.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const expect = chai.expect;
  
  
    describe('Profile Tests', () => {
      it('should update profile information', () => {
        const result = updateProfile('John', 'Doe', '123 Street', 'Apt 1', 'City', '12345');
        expect(result).to.exist;
      });
  
    });
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });