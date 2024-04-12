// Import necessary modules
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app.js'); // Update file extension to .js

// Configure Chai
chai.use(chaiHttp);
const { expect } = chai;

// Define test suite
describe('Registration Tests', () => {
    // Test case: Registration with valid data
    it('should register user with valid data', async () => {
        const res = await chai.request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password'
            });

        expect(res.status).toBe(200); // Assuming successful registration returns status code 200
        // Add more assertions as needed
    });

    // Test case: Registration with invalid data
    it('should return 400 for invalid registration data', async () => {
        const res = await chai.request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'invalid-email',
                password: 'password'
            });

        expect(res.status).toBe(400); // Assuming invalid registration data returns status code 400
        // Add more assertions as needed
    });

    // Add more test cases as needed

});
