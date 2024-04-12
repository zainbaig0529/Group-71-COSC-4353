// login.test.js

// Use dynamic import for chai module
import('chai').then(chai => {
    const { expect } = chai;
  
    // Assuming your Express app is defined in app.js
    const app = require('./app');
  
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
  
  }).catch(error => {
    // Handle any errors that occur during dynamic import
    console.error('Error loading chai:', error);
  });
  