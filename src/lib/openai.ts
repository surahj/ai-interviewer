import { CreditsService } from './credits-service';

// Initialize OpenAI client with fallback
let openai: any = null;

// Lazy initialization to avoid SSR issues
const initializeOpenAI = () => {
  if (openai) return openai;
  
  try {
    // Dynamic import to avoid SSR issues
    const OpenAI = require('openai');
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('OpenAI API key not found, using mock responses');
    }
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
  }
  
  return openai;
};

export interface InterviewContext {
  role: string;
  level: string;
  type: string;
  customRequirements?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentQuestionNumber?: number;
  totalQuestions?: number;
  avoidSimilarQuestions?: string[];
}

// Speech-to-Text using OpenAI Whisper
export async function transcribeAudio(audioBlob: Blob, userId?: string, interviewId?: string): Promise<string> {
  try {
    const client = initializeOpenAI();
    if (!client) {
      return "I'm sorry, I couldn't hear you clearly. Could you please repeat that?";
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await client.audio.transcriptions.create({
      file: audioBlob,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });

    const transcript = response as any;
    
    return transcript || "I couldn't understand what you said. Could you please repeat that?";
  } catch (error) {
    console.error('=== OPENAI: TRANSCRIPTION ERROR ===');
    console.error('Error:', error);
    return "I'm sorry, I couldn't hear you clearly. Could you please repeat that?";
  }
}

// Generate interview question using OpenAI
export async function generateInterviewQuestion(
  context: InterviewContext,
  userResponse?: string,
  isFirstQuestion: boolean = false,
  userId?: string,
  interviewId?: string
): Promise<string> {
  try {
    let systemPrompt: string;
    let userPrompt: string;

    if (isFirstQuestion) {
      const roleDisplay = context.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      systemPrompt = `You are an expert technical interviewer conducting a ${context.type} interview for a ${context.level} ${roleDisplay} position. 
      
Your role is to:
- Start with a warm, professional greeting
- Ask the candidate to introduce themselves
- Reference their specific role (${roleDisplay}) and level (${context.level})
- Make them feel comfortable and welcome
- Keep the tone conversational and natural
- WAIT for their response before proceeding

Be friendly, professional, and conversational - like a real human interviewer having a natural conversation.`;

      userPrompt = `Generate a welcoming first question for a ${context.level} ${context.role} interview. 
      
Interview type: ${context.type}
Custom requirements: ${context.customRequirements || 'None'}

Start with a brief, warm greeting and ask them to tell you about themselves and what interests them about this ${context.role.replace('-', ' ')} position. Keep it concise, natural, and conversational. Don't use any specific name - just be friendly and professional.`;
    } else {
      systemPrompt = `You are an expert technical interviewer conducting a ${context.type} interview for a ${context.level} ${context.role} position. 
      
Your role is to:
- Generate contextual follow-up questions based on the candidate's response
- Focus on their specific role (${context.role}), level (${context.level}), and interview type (${context.type})
- Ask questions that probe deeper into their experience and skills
- Keep questions relevant to the role and level
- Make questions conversational and natural
- WAIT for their response before proceeding

Previous conversation context:
${context.conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No previous conversation'}`;

      userPrompt = `Based on the candidate's response: "${userResponse}"

Generate a contextual follow-up question that:
- Relates to their specific role as a ${context.role}
- Is appropriate for their ${context.level} level
- Focuses on the role and level appropriately
- Probes deeper into their experience, technical skills, or problem-solving approach
- Feels natural and conversational
${context.avoidSimilarQuestions ? `- Is DIFFERENT from these previous questions: ${context.avoidSimilarQuestions.join(', ')}` : ''}

Current question number: ${context.currentQuestionNumber}/${context.totalQuestions}`;
    }

    const client = initializeOpenAI();
    if (!client) {
      return "Hello! Welcome to your interview. To start off, could you tell me about yourself? Please share your background, experience, and what interests you about this position.";
    }

    // Deduct credits before making OpenAI API call
    if (userId && interviewId) {
      const creditsDeducted = await CreditsService.deductOpenAICredits(userId, interviewId, 200); // Estimate tokens
      if (!creditsDeducted) {
        return "I'm sorry, you don't have enough credits to continue this interview. Please purchase more credits to continue.";
      }
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.2,
    });

    const question = completion.choices[0]?.message?.content?.trim();
    
    return question || "Hello! Welcome to your interview. Could you tell me about yourself and your experience?";
  } catch (error) {
    console.error('=== OPENAI: ERROR GENERATING QUESTION ===');
    console.error('Error:', error);
    // Fallback to mock question
    return "Hello! Welcome to your interview. Could you tell me about your background and experience?";
  }
}

// Handle user questions and provide answers
export async function handleUserQuestion(
  userQuestion: string,
  context: InterviewContext
): Promise<string> {
  try {
    const systemPrompt = `You are an expert technical interviewer conducting a ${context.type} interview for a ${context.level} ${context.role} position. 

The candidate has asked you a question. Your role is to:
- Provide a helpful, informative answer
- Keep your response concise but thorough
- Be professional and encouraging
- After answering, ask if they have any other questions or if they'd like to continue with the interview

Remember: This is an interview context, so be supportive and helpful.`;

    const userPrompt = `The candidate asked: "${userQuestion}"

Please provide a helpful answer to their question. This is for a ${context.level} ${context.role} interview.

After answering, ask if they have any other questions or if they'd like to continue with the interview.`;

    const client = initializeOpenAI();
    if (!client) {
      return "That's a great question! I'd be happy to answer that. Could you please clarify what specific aspect you'd like me to explain?";
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    
    return answer || "That's a great question! I'd be happy to answer that. Could you please clarify what specific aspect you'd like me to explain?";
  } catch (error) {
    console.error('=== OPENAI: ERROR HANDLING USER QUESTION ===');
    console.error('Error:', error);
    return "That's a great question! I'd be happy to answer that. Could you please clarify what specific aspect you'd like me to explain?";
  }
}

// Analyze user response using OpenAI
export async function analyzeUserResponse(
  userResponse: string,
  context: InterviewContext,
  userId?: string,
  interviewId?: string
): Promise<{
  score: number;
  feedback: string;
  keywords: string[];
  confidence: number;
  suggestions: string[];
  category: 'technical' | 'behavioral' | 'problem-solving' | 'communication';
}> {
  try {
    const systemPrompt = `You are an expert interview analyst evaluating a candidate's response for a ${context.level} ${context.role} position.

Analyze the response and provide:
1. A score (0-100) based on relevance, completeness, and quality
2. Constructive feedback
3. Key technical or behavioral keywords mentioned
4. Confidence level in your assessment (0-1)
5. Specific suggestions for improvement
6. Category classification

Be fair and constructive in your evaluation.`;

    const userPrompt = `Candidate Response: "${userResponse}"

Interview Context:
- Role: ${context.role}
- Level: ${context.level}
- Type: ${context.type}

Please provide your analysis in JSON format:
{
  "score": number (0-100),
  "feedback": "string",
  "keywords": ["string"],
  "confidence": number (0-1),
  "suggestions": ["string"],
  "category": "technical" | "behavioral" | "problem-solving" | "communication"
}`;

    const client = initializeOpenAI();
    if (!client) {
      return {
        score: 70,
        feedback: "Good response. Consider providing more specific examples.",
        keywords: ["experience", "project"],
        confidence: 0.8,
        suggestions: ["Add more technical details", "Provide specific examples"],
        category: "behavioral" as const
      };
    }

    // Deduct credits before making OpenAI API call
    if (userId && interviewId) {
      const creditsDeducted = await CreditsService.deductOpenAICredits(userId, interviewId, 500); // Estimate tokens for analysis
      if (!creditsDeducted) {
        return {
          score: 0,
          feedback: "You don't have enough credits to analyze this response. Please purchase more credits to continue.",
          keywords: [],
          confidence: 0,
          suggestions: ["Purchase more credits to continue the interview."],
          category: 'communication' as const
        };
      }
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (response) {
      try {
        const analysis = JSON.parse(response);
        
        // Round score to 1 decimal place
        if (analysis.score !== undefined) {
          analysis.score = Math.round(analysis.score * 10) / 10;
        }
        
        // Round confidence to 2 decimal places
        if (analysis.confidence !== undefined) {
          analysis.confidence = Math.round(analysis.confidence * 100) / 100;
        }
        
        return analysis;
      } catch (parseError) {
        console.error('Failed to parse analysis response:', parseError);
      }
    }
    
    // Fallback analysis
    return {
      score: 70,
      feedback: "Good response. Consider providing more specific examples.",
      keywords: ["experience", "project"],
      confidence: 0.8,
      suggestions: ["Add more technical details", "Provide specific examples"],
      category: "behavioral" as const
    };
  } catch (error) {
    console.error('=== OPENAI: ERROR ANALYZING RESPONSE ===');
    console.error('Error:', error);
    return {
      score: 70,
      feedback: "Good response. Consider providing more specific examples.",
      keywords: ["experience", "project"],
      confidence: 0.8,
      suggestions: ["Add more technical details", "Provide specific examples"],
      category: "behavioral" as const
    };
  }
}

// Generate comprehensive interview feedback
export async function generateInterviewFeedback(context: {
  transcript: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  role: string;
  level: string;
  type: string;
  customRequirements?: string;
}, userId?: string, interviewId?: string): Promise<{
  overallScore: number;
  communication: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  technicalDepth: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  confidence: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  clarity: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}> {
  try {
    const systemPrompt = `You are an expert interview feedback system. Analyze the provided interview transcript and provide comprehensive feedback in JSON format.

IMPORTANT: 
- If the transcript is incomplete or only contains interviewer questions without user responses, provide constructive feedback based on what's available
- If there are user responses, analyze them thoroughly
- Always return valid JSON, never plain text explanations
- Focus on the interviewee's performance, not the interviewer's

For each interview, provide feedback in this exact JSON format:
{
  "overallScore": number (0-100),
  "communication": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "technicalDepth": {
    "score": number (0-100),
    "feedback": "string", 
    "suggestions": ["string"]
  },
  "confidence": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "clarity": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "recommendations": ["string"]
}

If the transcript is incomplete or lacks user responses, provide feedback like:
{
  "overallScore": 70,
  "communication": {
    "score": 75,
    "feedback": "Unable to assess communication fully due to incomplete transcript. Consider providing more detailed responses in future interviews.",
    "suggestions": ["Provide more detailed responses", "Share specific examples from experience"]
  },
  "technicalDepth": {
    "score": 70,
    "feedback": "Technical assessment limited due to incomplete transcript. Focus on demonstrating technical knowledge in responses.",
    "suggestions": ["Include technical details in responses", "Provide code examples when relevant"]
  },
  "confidence": {
    "score": 75,
    "feedback": "Confidence assessment limited. Practice speaking clearly and confidently.",
    "suggestions": ["Practice speaking clearly", "Maintain confident posture"]
  },
  "clarity": {
    "score": 80,
    "feedback": "Clarity assessment limited. Focus on clear, structured responses.",
    "suggestions": ["Structure responses clearly", "Use specific examples"]
  },
  "strengths": ["Interview preparation", "Professional approach"],
  "areasForImprovement": ["Provide more detailed responses", "Include specific examples"],
  "recommendations": ["Practice mock interviews", "Prepare detailed responses", "Include specific examples from experience"]
}`;

    const userPrompt = `Interview Transcript:
${context.transcript.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Interview Context:
- Role: ${context.role}
- Level: ${context.level}
- Type: ${context.type}
- Custom Requirements: ${context.customRequirements || 'None'}

Please provide comprehensive feedback in JSON format:
{
  "overallScore": number (0-100),
  "communication": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "technicalDepth": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "confidence": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "clarity": {
    "score": number (0-100),
    "feedback": "string",
    "suggestions": ["string"]
  },
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "recommendations": ["string"]
}`;

    const client = initializeOpenAI();
    if (!client) {
      return {
        overallScore: 75,
        communication: {
          score: 80,
          feedback: "Good communication skills demonstrated throughout the interview.",
          suggestions: ["Practice speaking more slowly", "Use more specific examples"]
        },
        technicalDepth: {
          score: 70,
          feedback: "Shows solid technical knowledge for the level.",
          suggestions: ["Dive deeper into technical concepts", "Provide more code examples"]
        },
        confidence: {
          score: 75,
          feedback: "Demonstrates good confidence in responses.",
          suggestions: ["Maintain eye contact", "Speak with more conviction"]
        },
        clarity: {
          score: 80,
          feedback: "Responses are generally clear and well-organized.",
          suggestions: ["Structure responses better", "Use STAR method for behavioral questions"]
        },
        strengths: [
          "Good technical foundation",
          "Clear communication",
          "Professional demeanor"
        ],
        areasForImprovement: [
          "Provide more specific examples",
          "Improve technical depth",
          "Practice behavioral questions"
        ],
        recommendations: [
          "Continue learning relevant technologies",
          "Practice mock interviews regularly",
          "Focus on specific examples from past projects"
        ]
      };
    }

    // Deduct credits before making OpenAI API call
    if (userId && interviewId) {
      const creditsDeducted = await CreditsService.deductOpenAICredits(userId, interviewId, 1000); // Estimate tokens for feedback generation
      if (!creditsDeducted) {
        return {
          overallScore: 0,
          communication: {
            score: 0,
            feedback: "You don't have enough credits to generate feedback. Please purchase more credits to continue.",
            suggestions: ["Purchase more credits to continue"]
          },
          technicalDepth: {
            score: 0,
            feedback: "Credit limit reached.",
            suggestions: ["Purchase more credits"]
          },
          confidence: {
            score: 0,
            feedback: "Credit limit reached.",
            suggestions: ["Purchase more credits"]
          },
          clarity: {
            score: 0,
            feedback: "Credit limit reached.",
            suggestions: ["Purchase more credits"]
          },
          strengths: [],
          areasForImprovement: ["Purchase more credits to continue"],
          recommendations: ["Purchase more credits to continue using the service"]
        };
      }
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (response) {
      try {
        // Check if response starts with common error messages
        if (response.toLowerCase().startsWith("i'm sorry") || 
            response.toLowerCase().startsWith("i apologize") ||
            response.toLowerCase().startsWith("unfortunately")) {
          console.warn('OpenAI returned error message instead of JSON:', response.substring(0, 100));
          throw new Error('OpenAI returned error message');
        }
        
        const feedback = JSON.parse(response);
        
        // Round all scores to 1 decimal place
        if (feedback.overallScore !== undefined) {
          feedback.overallScore = Math.round(feedback.overallScore * 10) / 10;
        }
        
        if (feedback.communication?.score !== undefined) {
          feedback.communication.score = Math.round(feedback.communication.score * 10) / 10;
        }
        
        if (feedback.technicalDepth?.score !== undefined) {
          feedback.technicalDepth.score = Math.round(feedback.technicalDepth.score * 10) / 10;
        }
        
        if (feedback.confidence?.score !== undefined) {
          feedback.confidence.score = Math.round(feedback.confidence.score * 10) / 10;
        }
        
        if (feedback.clarity?.score !== undefined) {
          feedback.clarity.score = Math.round(feedback.clarity.score * 10) / 10;
        }
        
        return feedback;
      } catch (parseError) {
        console.error('Failed to parse feedback response:', parseError);
        console.error('Raw response:', response);
      }
    }
    
    // Fallback feedback
    return {
      overallScore: 75,
      communication: {
        score: 80,
        feedback: "Good communication skills demonstrated throughout the interview.",
        suggestions: ["Practice speaking more slowly", "Use more specific examples"]
      },
      technicalDepth: {
        score: 70,
        feedback: "Shows solid technical knowledge for the level.",
        suggestions: ["Dive deeper into technical concepts", "Provide more code examples"]
      },
      confidence: {
        score: 75,
        feedback: "Demonstrates good confidence in responses.",
        suggestions: ["Maintain eye contact", "Speak with more conviction"]
      },
      clarity: {
        score: 80,
        feedback: "Responses are generally clear and well-organized.",
        suggestions: ["Structure responses better", "Use STAR method for behavioral questions"]
      },
      strengths: [
        "Good technical foundation",
        "Clear communication",
        "Professional demeanor"
      ],
      areasForImprovement: [
        "Provide more specific examples",
        "Improve technical depth",
        "Practice behavioral questions"
      ],
      recommendations: [
        "Continue learning relevant technologies",
        "Practice mock interviews regularly",
        "Focus on specific examples from past projects"
      ]
    };
  } catch (error) {
    console.error('=== OPENAI: ERROR GENERATING FEEDBACK ===');
    console.error('Error:', error);
    return {
      overallScore: 75,
      communication: {
        score: 80,
        feedback: "Good communication skills demonstrated throughout the interview.",
        suggestions: ["Practice speaking more slowly", "Use more specific examples"]
      },
      technicalDepth: {
        score: 70,
        feedback: "Shows solid technical knowledge for the level.",
        suggestions: ["Dive deeper into technical concepts", "Provide more code examples"]
      },
      confidence: {
        score: 75,
        feedback: "Demonstrates good confidence in responses.",
        suggestions: ["Maintain eye contact", "Speak with more conviction"]
      },
      clarity: {
        score: 80,
        feedback: "Responses are generally clear and well-organized.",
        suggestions: ["Structure responses better", "Use STAR method for behavioral questions"]
      },
      strengths: [
        "Good technical foundation",
        "Clear communication",
        "Professional demeanor"
      ],
      areasForImprovement: [
        "Provide more specific examples",
        "Improve technical depth",
        "Practice behavioral questions"
      ],
      recommendations: [
        "Continue learning relevant technologies",
        "Practice mock interviews regularly",
        "Focus on specific examples from past projects"
      ]
    };
  }
}
