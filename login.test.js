// login.test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Assuming your server is defined in app.js
const { expect } = chai;

chai.use(chaiHttp);

describe('User Login', () => {
  it('should login a user with valid credentials', (done) => {
    chai.request(app)
      .post('/login.html')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Assuming successful login returns status code 200
        // Add more assertions as needed
        done();
      });
  });

  it('should reject login with invalid credentials', (done) => {
    chai.request(app)
      .post('/login.html')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(401); // Assuming invalid login returns status code 401
        // Add more assertions as needed
        done();
      });
  });

  it('should display error message for empty email field', (done) => {
    chai.request(app)
      .post('/login.html')
      .send({
        email: '',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res.text).to.include('Email is required'); // Assuming the server returns an error message
        // Add more assertions as needed
        done();
      });
  });

  // Add more test cases as needed
});

  