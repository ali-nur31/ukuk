const axios = require('axios');

class AIService {
  constructor() {
    this.apiUrl = process.env.AI_SERVICE_URL;
    this.apiKey = process.env.AI_SERVICE_API_KEY;
  }

  async analyzeText(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/analyze`, {
        text
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error('Failed to analyze text');
    }
  }

  async generateResponse(prompt) {
    try {
      const response = await axios.post(`${this.apiUrl}/generate`, {
        prompt
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error('Failed to generate response');
    }
  }

  async getRecommendations(userId, context) {
    try {
      const response = await axios.post(`${this.apiUrl}/recommendations`, {
        userId,
        context
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error('Failed to get recommendations');
    }
  }
}

module.exports = new AIService(); 