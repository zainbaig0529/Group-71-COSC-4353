// Import necessary modules
const chai = require('chai');
const chaiHttp = require('chai-http');

// Configure Chai
chai.use(chaiHttp);
const expect = chai.expect;

// Describe the test suite
describe('User Registration', () => {
  // Test case for successful registration
  it('should register a new user with valid input data', (done) => {
    chai.request('http://localhost:3000') // Replace with your server URL
      .post('/registration.html')
      .send({
        email: 'test@example.com',
        password: 'password123',
        confirm: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming successful registration returns status code 200
        // Add more assertions as needed
        done();
      });
  });

  // Test case for registration with missing email field
  it('should reject registration with missing email field', (done) => {
    chai.request('http://localhost:3000') // Replace with your server URL
      .post('/registration.html')
      .send({
        password: 'password123',
        confirm: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(400); // Assuming missing email field returns status code 400
        // Add more assertions as needed
        done();
      });
  });

});
