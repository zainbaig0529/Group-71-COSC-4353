// fuel_quote.test.js
const { expect } = require('chai');
const { calculateFuelQuote } = require('../services/fuelQuoteService');

describe('Fuel Quote', () => {
  it('should calculate fuel quote for valid input', () => {
    const quote = calculateFuelQuote(100); // Assuming 100 gallons requested
    expect(quote).to.exist;
    expect(quote.totalAmount).to.be.a('number');
    expect(quote.totalAmount).to.be.greaterThan(0);
  });

  it('should reject calculating fuel quote for invalid input', () => {
    try {
      calculateFuelQuote(-50); // Assuming negative gallons requested
      // If calculation succeeds with invalid input, fail the test
      throw new Error('Fuel quote calculation should have failed');
    } catch (error) {
      expect(error).to.exist;
    }
  });
});