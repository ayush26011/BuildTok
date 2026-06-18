import API from './api';

export const authService = {
  /**
   * Register a new user
   * @param {string} name
   * @param {string} username
   * @param {string} email
   * @param {string} password
   */
  async register(name, username, email, password) {
    return API.post('/auth/register', { name, username, email, password });
  },

  /**
   * Log in an existing user
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    return API.post('/auth/login', { email, password });
  },

  /**
   * Get current authenticated user's profile
   */
  async getMe() {
    return API.get('/auth/me');
  },
};
