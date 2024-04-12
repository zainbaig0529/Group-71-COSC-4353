// Import necessary modules
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Update file extension to .js

// Configure Chai
chai.use(chaiHttp);
const { expect } = chai;

// Import the request function from chai-http
const request = chai.request;

describe('POST /login.html', () => {
  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'invalid-email', password: 'validpassword' });
    expect(res.status).to.equal(400); // Update assertion syntax
  });

  it('should return 400 if password is invalid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'valid@example.com', password: 'short' });
    expect(res.status).to.equal(400); // Update assertion syntax
  });

  it('should return 200 if email and password are valid', async () => {
    const res = await request(app)
      .post('/login.html')
      .send({ email: 'valid@example.com', password: 'validpassword' });
    expect(res.status).to.equal(200); // Update assertion syntax
  });

  // Add more test cases as needed
});

  