// Import necessary modules
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app.js'); // Update file extension to .js

// Configure Chai
chai.use(chaiHttp);
const { expect } = chai;

// Define test suite
describe('Login Tests', () => {
    // Test case: Login with valid credentials
    it('should log in with valid credentials', async () => {
        const res = await chai.request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password'
            });

        expect(res.status).toBe(200); // Assuming successful login returns status code 200
        // Add more assertions as needed
    });

    // Test case: Login with invalid email
    it('should return 400 if email is invalid', async () => {
        const res = await chai.request(app)
            .post('/login')
            .send({
                email: 'invalid-email',
                password: 'password'
            });

        expect(res.status).toBe(400); // Assuming invalid email returns status code 400
        // Add more assertions as needed
    });

    // Add more test cases as needed

});

  