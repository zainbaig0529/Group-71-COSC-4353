// Import necessary modules
const chai = require('chai');

// Use expect from chai
const expect = chai.expect;

// Define test suite
describe('Profile Tests', () => {
  it('should update profile information', () => {
    const result = updateProfile('John', 'Doe', '123 Street', 'Apt 1', 'City', '12345');
    expect(result).to.exist;
  });
});
