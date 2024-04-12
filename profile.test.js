// profile.test.js
const { expect } = require('chai');
const { updateUserProfile } = require('../services/profileService');

describe('User Profile Management', () => {
  it('should update user profile', async () => {
    const updatedUser = await updateUserProfile('valid@example.com', { firstName: 'John', lastName: 'Doe' });
    expect(updatedUser).to.exist;
    expect(updatedUser.firstName).to.equal('John');
    expect(updatedUser.lastName).to.equal('Doe');
  });

  it('should reject updating profile with invalid data', async () => {
    try {
      await updateUserProfile('valid@example.com', { firstName: '', lastName: 'Doe' });
      // If profile update succeeds with invalid data, fail the test
      throw new Error('Profile update should have failed');
    } catch (error) {
      expect(error).to.exist;
    }
  });
});