import API, { UPLOAD_API } from './api';

export const projectService = {
  /**
   * Get paginated project feed
   * @param {Object} params - query parameters (page, limit, category, trending)
   */
  async getFeed(params) {
    return API.get('/projects/feed', { params });
  },

  /**
   * Get single project by ID
   * @param {string} id
   */
  async getProjectById(id) {
    return API.get(`/projects/${id}`);
  },

  /**
   * Create a new project (multi-part form data for files)
   * Uses the UPLOAD_API instance with a 5-minute timeout to handle large video
   * uploads to Cloudinary without timing out.
   *
   * IMPORTANT: Do NOT set Content-Type manually — axios auto-generates the
   * correct multipart/form-data boundary when it detects a FormData body.
   * Setting it manually strips the boundary and multer will silently reject
   * the request body.
   *
   * @param {FormData} formData
   */
  async createProject(formData) {
    return UPLOAD_API.post('/projects', formData);
  },

  /**
   * Update project fields
   * @param {string} id
   * @param {Object} data
   */
  async updateProject(id, data) {
    return API.put(`/projects/${id}`, data);
  },

  /**
   * Delete project
   * @param {string} id
   */
  async deleteProject(id) {
    return API.delete(`/projects/${id}`);
  },

  /**
   * Toggle like state of a project
   * @param {string} id
   */
  async toggleLike(id) {
    return API.put(`/projects/${id}/like`);
  },

  /**
   * Toggle save/bookmark state of a project
   * @param {string} id
   */
  async toggleSave(id) {
    return API.put(`/projects/${id}/save`);
  },

  /**
   * Fetch comments for a project
   * @param {string} projectId
   * @param {Object} params - pagination (page, limit)
   */
  async getComments(projectId, params) {
    return API.get(`/comments/${projectId}`, { params });
  },

  /**
   * Add a comment/reply to a project
   * @param {string} projectId
   * @param {string} text
   * @param {string|null} parentCommentId
   */
  async addComment(projectId, text, parentCommentId = null) {
    return API.post(`/comments/${projectId}`, { text, parentCommentId });
  },

  /**
   * Register a project view event
   * @param {string} id
   */
  async registerView(id) {
    return API.put(`/projects/${id}/view`);
  },
};
