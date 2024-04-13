// fuel_quote.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const expect = chai.expect;
  
  
    describe('Fuel Quote Tests', () => {
      it('should perform a fuel quote calculation', () => {
        // Your test code goes here
        // For example:
        const result = calculateFuelQuote(100); // Assuming 100 gallons requested
        expect(result).to.exist;
        expect(result.totalAmount).to.be.a('number');
        expect(result.totalAmount).to.be.greaterThan(0);
      });
  
    });
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });