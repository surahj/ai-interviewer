const { test, expect } = require('@playwright/test');

test.describe('Real-time Conversation', () => {
  test('should create real-time session', async ({ request }) => {
    const response = await request.post('/api/interview/realtime-session', {
      data: {
        role: 'software-engineer',
        level: 'mid-level',
        type: 'technical',
        customRequirements: 'React and JavaScript'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.sessionId).toBeDefined();
    expect(data.session).toBeDefined();
    expect(data.interviewConfig).toBeDefined();
  });

  test('should get session data', async ({ request }) => {
    // First create a session
    const createResponse = await request.post('/api/interview/realtime-session', {
      data: {
        role: 'software-engineer',
        level: 'mid-level',
        type: 'technical'
      }
    });

    const createData = await createResponse.json();
    const sessionId = createData.sessionId;

    // Then get the session data
    const getResponse = await request.get(`/api/interview/realtime-session/${sessionId}`);
    
    expect(getResponse.ok()).toBeTruthy();
    const data = await getResponse.json();
    expect(data.session).toBeDefined();
    expect(data.session.id).toBe(sessionId);
  });

  test('should handle invalid session ID', async ({ request }) => {
    const response = await request.get('/api/interview/realtime-session/invalid-id');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(500);
  });
});
