const axios = require('axios');

class AIService {
  constructor() {
    this.aiServiceUrl = 'http://localhost:5001';
  }

  async getAnswer(question) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/query`, {
        question
      });
      return response.data.answer;
    } catch (error) {
      console.error('Error getting answer from AI service:', error);
      throw error;
    }
  }
}

module.exports = new AIService(); 