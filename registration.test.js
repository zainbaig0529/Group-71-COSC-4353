// Import necessary modules
import('chai').then(chai => {
  const chaiHttp = require('chai-http');
  const app = require('./app.js'); // Update file extension to .js

  // Configure Chai
  chai.use(chaiHttp);
  const { expect } = chai;

  // Define test suite
  describe('Registration Tests', () => {
      // Test case: Registration with valid data
      it('should register user with valid data', (done) => {
          chai.request(app)
              .post('/register')
              .send({
                  username: 'testuser',
                  email: 'test@example.com',
                  password: 'password'
              })
              .end((err, res) => {
                  expect(res).to.have.status(200); // Assuming successful registration returns status code 200
                  // Add more assertions as needed
                  done();
              });
      });

      // Test case: Registration with invalid data
      it('should return 400 for invalid registration data', (done) => {
          chai.request(app)
              .post('/register')
              .send({
                  username: 'testuser',
                  email: 'invalid-email',
                  password: 'password'
              })
              .end((err, res) => {
                  expect(res).to.have.status(400); // Assuming invalid registration data returns status code 400
                  // Add more assertions as needed
                  done();
              });
      });

      // Add more test cases as needed

  });
}).catch(error => {
  // Handle any errors that occur during dynamic import
  console.error('Error loading chai:', error);
});
