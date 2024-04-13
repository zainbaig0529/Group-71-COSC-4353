// Import necessary modules
import('chai').then(chai => {
    const chaiHttp = require('chai-http');
    const app = require('./app.js'); // Update file extension to .js
  
    // Configure Chai
    chai.use(chaiHttp);
    const { expect } = chai;
  
    // Define test suite
    describe('Login Tests', () => {
        // Test case: Login with valid credentials
        it('should log in with valid credentials', (done) => {
            chai.request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'password'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200); // Assuming successful login returns status code 200
                    // Add more assertions as needed
                    done();
                });
        });
  
        // Test case: Login with invalid email
        it('should return 400 if email is invalid', (done) => {
            chai.request(app)
                .post('/login')
                .send({
                    email: 'invalid-email',
                    password: 'password'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400); // Assuming invalid email returns status code 400
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

  