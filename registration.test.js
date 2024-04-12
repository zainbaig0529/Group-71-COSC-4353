// Import necessary modules
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Assuming your Express app is defined in app.js

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

  it('should display error message for invalid password length', (done) => {
    chai.request(app)
      .post('/registration.html')
      .send({
        email: 'test@example.com',
        password: 'short',
        confirm: 'short'
      })
      .end((err, res) => {
        expect(res.text).to.include('Invalid password'); // Assuming the server returns an error message
        // Add more assertions as needed
        done();
      });
  });

  // Test case: Confirmation password matching
  it('should display error message if confirmation password does not match', (done) => {
    chai.request(app)
      .post('/registration.html')
      .send({
        email: 'test@example.com',
        password: 'password123',
        confirm: 'differentpassword'
      })
      .end((err, res) => {
        expect(res.text).to.include('Passwords do not match'); // Assuming the server returns an error message
        // Add more assertions as needed
        done();
      });
  });

  // Test case: Navigation to login page
  it('should navigate to login page when "Sign in" link is clicked', (done) => {
    chai.request(app)
      .get('/registration.html')
      .end((err, res) => {
        expect(res.text).to.include('<a href="login.html">Sign in</a>'); // Assuming the login link is present in the response HTML
        // Add more assertions as needed
        done();
      });
  });
});
