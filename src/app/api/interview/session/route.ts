import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SessionRequest {
  role: string;
  level: string;
  name?: string;
  type?: string;
  duration?: string;
  customRequirements?: string;
}

interface SessionResponse {
  sessionId: string;
  sessionToken: string;
  systemPrompt: string;
  interviewConfig: {
    role: string;
    level: string;
    name?: string;
    type: string;
    duration: number;
    customRequirements?: string;
    totalQuestions: number;
  };
  realtimeSession?: {
    id: string;
    client_secret: {
      value: string;
      expires_at: number;
    };
    expires_at: number;
  };
}

// Generate system prompt for the AI interviewer
function generateSystemPrompt(config: SessionRequest): string {
  const { role, level, name, type, customRequirements } = config;
  
  // Role-specific persona
  const rolePersonas = {
    'software-engineer': 'technical hiring manager',
    'frontend-developer': 'frontend engineering manager',
    'backend-developer': 'backend engineering manager',
    'fullstack-developer': 'full-stack engineering manager',
    'data-scientist': 'data science hiring manager',
    'devops-engineer': 'DevOps engineering manager',
    'product-manager': 'product management director',
    'ui-ux-designer': 'design team lead',
    'qa-engineer': 'quality assurance manager',
    'mobile-developer': 'mobile engineering manager'
  };

  const persona = rolePersonas[role as keyof typeof rolePersonas] || 'hiring manager';
  
  // Level-specific context
  const levelContext = {
    'junior': 'entry-level position requiring 0-2 years of experience',
    'mid-level': 'mid-level position requiring 3-5 years of experience',
    'senior': 'senior-level position requiring 6-8 years of experience',
    'lead': 'leadership position requiring 8+ years of experience'
  };

  const levelDescription = levelContext[level as keyof typeof levelContext] || 'professional position';

  // Interview type context
  const typeContext = {
    'technical': 'technical skills and problem-solving abilities',
    'behavioral': 'soft skills, past experiences, and behavioral competencies',
    'mixed': 'both technical skills and behavioral competencies',
    'case-study': 'real-world problem-solving scenarios'
  };

  const typeDescription = typeContext[type as keyof typeof typeContext] || 'professional competencies';

  const focusDescription = 'software development';

  // Custom requirements context
  const customContext = customRequirements ? `\n\nAdditional focus areas: ${customRequirements}` : '';

  const systemPrompt = `You are a ${persona} conducting a professional interview for a ${levelDescription} in ${role.replace('-', ' ')}. 

Your role is to assess the candidate's ${typeDescription} with a focus on ${focusDescription}.${customContext}

Interview Guidelines:
1. Start with a professional greeting: "Hello ${name || 'there'}, welcome to your interview. I'm excited to learn more about you and your experience."
2. Ask 10-15 structured questions appropriate for the ${level} level
3. Adapt your questions based on the candidate's responses
4. Provide natural follow-up questions to explore topics deeper
5. Maintain a professional but conversational tone
6. Allow the candidate to speak naturally and don't interrupt
7. End the interview politely: "Thank you for your time today. This concludes our interview."

Question Types:
- For technical interviews: Focus on technical knowledge, problem-solving, and hands-on experience
- For behavioral interviews: Focus on past experiences, teamwork, leadership, and soft skills
- For mixed interviews: Balance technical and behavioral questions
- For case studies: Present real-world scenarios and assess problem-solving approach

Remember:
- Be conversational and natural
- Listen actively to responses
- Ask clarifying questions when needed
- Provide encouraging feedback
- Keep the interview flowing smoothly
- Respect the candidate's time and experience level

Current interview context: ${role} position at ${level} level, focusing on ${focusDescription}.`;

  return systemPrompt;
}

// Calculate total questions based on duration
function calculateTotalQuestions(duration: string): number {
  const durationMap: { [key: string]: number } = {
    '15': 8,
    '30': 12,
    '45': 15,
    '60': 20
  };
  return durationMap[duration] || 12;
}

// Create OpenAI Realtime session with fallback
async function createOpenAIRealtimeSession(systemPrompt: string, body: any): Promise<any | null> {
  try {
    console.log('=== ATTEMPTING OPENAI REALTIME SESSION CREATION ===');
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not found, skipping Realtime session creation');
      return null;
    }

    console.log('Making request to OpenAI Realtime API...');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('System prompt length:', systemPrompt.length);
    
    // Use a simplified system prompt for testing
    const simplifiedPrompt = `You are an expert technical interviewer conducting a ${body.type} interview for a ${body.level} ${body.role} position. Be conversational and professional.`;
    
    const requestBody = {
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'verse',
      instructions: simplifiedPrompt,
      tools: [],
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200,
        create_response: true,
        interrupt_response: true
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI API Response Status:', response.status);
    console.log('OpenAI API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Realtime API error:', response.status, errorText);
      
      // If it's a 401 or 403, it might be API key or access issues
      if (response.status === 401 || response.status === 403) {
        console.log('OpenAI API authentication failed - Realtime API access may not be available');
        return null;
      }
      
      // If it's a 404, the endpoint might not exist yet
      if (response.status === 404) {
        console.log('OpenAI Realtime API endpoint not found - API may not be available yet');
        return null;
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    console.log('OpenAI API response was successful, parsing JSON...');

    const sessionData = await response.json();
    console.log('OpenAI Realtime session created successfully:', sessionData);
    return sessionData;
  } catch (error) {
    console.error('Error creating OpenAI Realtime session:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return null to indicate fallback should be used
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SessionRequest = await request.json();
    const { role, level, name, type = 'mixed', duration = '15', customRequirements } = body;

    console.log('=== CREATE INTERVIEW SESSION ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!role || !level) {
      return NextResponse.json(
        { error: 'Role and level are required' },
        { status: 400 }
      );
    }

    // Generate system prompt
    const systemPrompt = generateSystemPrompt(body);
    
    // Calculate total questions
    const totalQuestions = calculateTotalQuestions(duration);

    // Generate a proper UUID for the session ID
    const sessionId = crypto.randomUUID();

    // Try to create OpenAI Realtime session (with fallback)
    console.log('Attempting to create OpenAI Realtime session...');
    const realtimeSession = await createOpenAIRealtimeSession(systemPrompt, body);
    
    if (realtimeSession) {
      console.log('OpenAI Realtime session created successfully');
      console.log('Realtime Session ID:', realtimeSession.id);
      console.log('Realtime Session Client Secret:', realtimeSession.client_secret ? 'Present' : 'Missing');
    } else {
      console.log('OpenAI Realtime session creation failed, using fallback mode');
    }

    // Create interview record in database
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        id: sessionId,
        role,
        level,
        candidate_name: name,
        interview_type: type,
        duration: parseInt(duration),
        focus_area: 'general',
        custom_requirements: customRequirements,
        total_questions: totalQuestions,
        status: 'active',
        openai_session_id: realtimeSession?.id || null,
        openai_session_token: realtimeSession?.client_secret?.value || null,
        openai_session_expires_at: realtimeSession?.expires_at ? new Date(realtimeSession.expires_at * 1000) : null
      })
      .select()
      .single();

    if (interviewError) {
      console.error('Database error:', interviewError);
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      );
    }

    console.log('Interview record created in database:', interview);

    const response: SessionResponse = {
      sessionId,
      sessionToken: `token_${sessionId}_${Date.now()}`,
      systemPrompt,
      interviewConfig: {
        role,
        level,
        name,
        type,
        duration: parseInt(duration),
        customRequirements,
        totalQuestions
      }
    };

    // Add realtime session data if available
    if (realtimeSession) {
      response.realtimeSession = {
        id: realtimeSession.id,
        client_secret: realtimeSession.client_secret,
        expires_at: realtimeSession.expires_at
      };
    }

    console.log('=== SESSION CREATED ===');
    console.log('Session ID:', sessionId);
    console.log('Realtime Session Available:', !!realtimeSession);
    console.log('System Prompt Length:', systemPrompt.length);
    console.log('Total Questions:', totalQuestions);

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== SESSION CREATION ERROR ===');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve session from database
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !interview) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: interview.id,
      status: interview.status,
      role: interview.role,
      level: interview.level,
      candidateName: interview.candidate_name,
      interviewType: interview.interview_type,
      duration: interview.duration,
      focusArea: interview.focus_area,
      customRequirements: interview.custom_requirements,
      totalQuestions: interview.total_questions,
      createdAt: interview.created_at
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
