// Import necessary modules
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from './app'; // Assuming your Express app is defined in app.js

// Configure Chai
chai.use(chaiHttp);
const { expect } = chai;

// Define test suite
describe('User Registration Form', () => {
  // Test case: Form submission with valid data
  it('should submit form with valid data', (done) => {
    chai.request(app)
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

  // Test case: Field validation
  it('should display error message for invalid email format', (done) => {
    chai.request(app)
      .post('/registration.html')
      .send({
        email: 'invalid-email',
        password: 'password123',
        confirm: 'password123'
      })
      .end((err, res) => {
        expect(res.text).to.include('Invalid email'); // Assuming the server returns an error message
        // Add more assertions as needed
        done();
      });
  });

  // Add more test cases as needed

});
