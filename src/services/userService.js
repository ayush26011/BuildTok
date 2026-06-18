import API, { UPLOAD_API } from './api';

export const userService = {
  /**
   * Get user public profile by user ID
   * @param {string} id
   */
  async getUserById(id) {
    return API.get(`/users/${id}`);
  },

  /**
   * Update authenticated user profile details & avatar
   * @param {FormData} formData
   */
  async updateProfile(formData) {
    return UPLOAD_API.put('/users/profile', formData);
  },

  /**
   * Toggle follow status for a user
   * @param {string} id
   */
  async followUser(id) {
    return API.put(`/users/follow/${id}`);
  },

  /**
   * Search users by name, username, or bio
   * @param {string} query
   */
  async searchUsers(query) {
    return API.get('/users/search', { params: { query } });
  },
};
