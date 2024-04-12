// registration.test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Assuming your server is defined in app.js
const { expect } = chai;

chai.use(chaiHttp);

describe('User Registration', () => {
  it('should register a new user with valid input data', (done) => {
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

  it('should reject registration with missing email field', (done) => {
    chai.request(app)
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

  // Add more test cases as needed
});
