const { test, expect } = require('@playwright/test');

// Test Suite: Supabase Backend Features
describe('Supabase Backend Features', () => {
  
  // Test Group: Supabase Authentication
  describe('Supabase Authentication', () => {
    test('should register new user successfully', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      });
      
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('session');
    });

    test('should login user successfully', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('session');
    });

    test('should validate user credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      
      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should refresh access token', async ({ request }) => {
      // First login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      const refreshToken = loginData.session.refresh_token;
      
      const response = await request.post('/api/auth/refresh', {
        data: {
          refreshToken: refreshToken
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('session');
    });

    test('should logout user successfully', async ({ request }) => {
      // First login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      const accessToken = loginData.session.access_token;
      
      const response = await request.post('/api/auth/logout', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      expect(response.status()).toBe(200);
    });
  });

  // Test Group: Interview Management with Supabase
  describe('Interview Management with Supabase', () => {
    let authToken;

    test.beforeEach(async ({ request }) => {
      // Login to get auth token
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.session.access_token;
    });

    test('should create new interview session', async ({ request }) => {
      const response = await request.post('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          job_role: 'software-engineer',
          experience_level: 'mid-level',
          duration: 30,
          focus_areas: ['technical', 'behavioral']
        }
      });
      
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('questions');
    });

    test('should get interview session by ID', async ({ request }) => {
      // First create an interview
      const createResponse = await request.post('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          jobRole: 'software-engineer',
          experienceLevel: 'mid-level',
          duration: 30,
          focusAreas: ['technical']
        }
      });
      
      const createData = await createResponse.json();
      const interviewId = createData.id;
      
      const response = await request.get(`/api/interviews/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id', interviewId);
      expect(data).toHaveProperty('status');
    });

    test('should submit interview response', async ({ request }) => {
      // First create an interview
      const createResponse = await request.post('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          jobRole: 'software-engineer',
          experienceLevel: 'mid-level',
          duration: 30,
          focusAreas: ['technical']
        }
      });
      
      const createData = await createResponse.json();
      const interviewId = createData.id;
      const questionId = createData.questions[0].id;
      
      const response = await request.post(`/api/interviews/${interviewId}/responses`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          question_id: questionId,
          response: 'This is my answer to the technical question.',
          response_type: 'text',
          duration: 120
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('feedback');
      expect(data).toHaveProperty('score');
    });

    test('should get interview results', async ({ request }) => {
      // First create and complete an interview
      const createResponse = await request.post('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          jobRole: 'software-engineer',
          experienceLevel: 'mid-level',
          duration: 30,
          focusAreas: ['technical']
        }
      });
      
      const createData = await createResponse.json();
      const interviewId = createData.id;
      
      // Complete the interview
      await request.post(`/api/interviews/${interviewId}/complete`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const response = await request.get(`/api/interviews/${interviewId}/results`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('overall_score');
      expect(data).toHaveProperty('detailed_feedback');
      expect(data).toHaveProperty('improvement_suggestions');
    });

    test('should list user interviews', async ({ request }) => {
      const response = await request.get('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.interviews)).toBe(true);
    });
  });

  // Test Group: Question Management with Supabase
  describe('Question Management with Supabase', () => {
    let authToken;

    test.beforeEach(async ({ request }) => {
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.session.access_token;
    });

    test('should get questions by job role', async ({ request }) => {
      const response = await request.get('/api/questions?job_role=software-engineer&experience_level=mid-level', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBeGreaterThan(0);
    });

    test('should get questions by category', async ({ request }) => {
      const response = await request.get('/api/questions?category=technical&difficulty=medium', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.questions)).toBe(true);
    });

    test('should get random question set', async ({ request }) => {
      const response = await request.get('/api/questions/random?count=5&jobRole=software-engineer', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBe(5);
    });
  });

  // Test Group: Analytics with Supabase
  describe('Analytics with Supabase', () => {
    let authToken;

    test.beforeEach(async ({ request }) => {
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.session.access_token;
    });

    test('should get user performance analytics', async ({ request }) => {
      const response = await request.get('/api/analytics/performance', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('overall_score');
      expect(data).toHaveProperty('skill_breakdown');
      expect(data).toHaveProperty('improvement_trend');
    });

    test('should get skill assessment data', async ({ request }) => {
      const response = await request.get('/api/analytics/skills', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('technical_skills');
      expect(data).toHaveProperty('soft_skills');
      expect(data).toHaveProperty('recommendations');
    });

    test('should get interview history', async ({ request }) => {
      const response = await request.get('/api/analytics/history', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.interviews)).toBe(true);
    });
  });

  // Test Group: File Management with Supabase Storage
  describe('File Management with Supabase Storage', () => {
    let authToken;

    test.beforeEach(async ({ request }) => {
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.session.access_token;
    });

    test('should upload audio file', async ({ request }) => {
      const response = await request.post('/api/files/upload-audio', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          file: Buffer.from('fake audio data'),
          filename: 'response.wav',
          interview_id: '123'
        }
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('file_id');
      expect(data).toHaveProperty('url');
    });

    test('should download interview results', async ({ request }) => {
      const response = await request.get('/api/files/download-results?interview_id=123&format=pdf', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
    });
  });

  // Test Group: Error Handling
  describe('Error Handling', () => {
    test('should handle invalid authentication token', async ({ request }) => {
      const response = await request.get('/api/interviews', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      expect(response.status()).toBe(401);
    });

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'test@example.com'
          // Missing password
        }
      });
      
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should handle resource not found', async ({ request }) => {
      const response = await request.get('/api/interviews/nonexistent-id', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });
      
      expect(response.status()).toBe(404);
    });

    test('should handle rate limiting', async ({ request }) => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.post('/api/auth/login', {
            data: {
              email: 'test@example.com',
              password: 'password123'
            }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimitedResponse = responses.find(r => r.status() === 429);
      
      expect(rateLimitedResponse).toBeTruthy();
    });
  });
});
