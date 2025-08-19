# Real-time Speech-to-Speech Conversation

This project now includes a real-time speech-to-speech conversation feature using OpenAI's real-time API. This provides a more natural and fluid interview experience compared to the traditional speech recognition and synthesis approach.

## Features

### Real-time Conversation
- **Direct AI Communication**: Uses OpenAI's real-time API for instant speech-to-speech conversation
- **Natural Flow**: No delays between user speech and AI response
- **High Quality Audio**: AI responses are generated in real-time with natural voice
- **Contextual Understanding**: AI maintains conversation context throughout the interview

### Technical Implementation

#### Core Components

1. **RealtimeConversationManager** (`src/lib/realtime-conversation.ts`)
   - Handles WebRTC connection to OpenAI's real-time API
   - Manages audio streams for both user input and AI output
   - Provides connection state management and error handling

2. **Real-time Session API** (`src/app/api/interview/realtime-session/route.ts`)
   - Creates OpenAI real-time sessions with interview-specific instructions
   - Configures the AI interviewer with role, level, and type information
   - Manages session lifecycle

3. **Real-time Interview Page** (`src/app/interview/realtime/page.tsx`)
   - Clean, focused interface for real-time conversation
   - Shows connection status and conversation history
   - Provides mute/unmute controls

#### How It Works

1. **Session Creation**: When starting a real-time interview, the system creates an OpenAI real-time session with specific instructions for the interview role and type.

2. **WebRTC Connection**: Establishes a WebRTC peer connection to OpenAI's real-time API, enabling bidirectional audio streaming.

3. **Real-time Communication**: 
   - User's microphone audio is streamed directly to OpenAI
   - AI processes the audio and responds with natural speech
   - Responses are played back through the user's speakers

4. **Context Management**: The AI maintains conversation context throughout the interview, asking relevant follow-up questions based on the candidate's responses.

## Usage

### Starting a Real-time Interview

1. Navigate to the interview setup page (`/setup-interview`)
2. Configure your interview parameters (role, level, type, etc.)
3. Choose "Real-time Conversation" option
4. The system will automatically:
   - Create an OpenAI real-time session
   - Establish the WebRTC connection
   - Begin the conversation

### Controls

- **Mute/Unmute**: Toggle your microphone on/off
- **End Interview**: Terminate the session and generate feedback
- **Connection Status**: Monitor the real-time connection state

### Browser Requirements

The real-time conversation feature requires:
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Microphone access
- Stable internet connection
- OpenAI API access

## Comparison with Standard Interview

| Feature | Standard Interview | Real-time Conversation |
|---------|-------------------|------------------------|
| **Response Time** | 2-5 seconds | < 1 second |
| **Audio Quality** | Text-to-speech | Natural AI voice |
| **Conversation Flow** | Turn-based | Natural back-and-forth |
| **Context Awareness** | Limited | Full conversation context |
| **Browser Support** | Wide | Modern browsers only |
| **API Requirements** | Standard OpenAI API | Real-time API access |

## Configuration

### Environment Variables

Ensure you have the following environment variables set:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Interview Instructions

The AI interviewer is configured with role-specific instructions that include:
- Interview type (technical, behavioral, mixed)
- Experience level (junior, mid-level, senior, lead)
- Custom requirements and focus areas
- Professional tone and conversation style

## Error Handling

The system includes comprehensive error handling for:
- Connection failures
- Audio device issues
- API rate limits
- Network interruptions

If the real-time connection fails, users are automatically redirected to the standard interview mode as a fallback.

## Future Enhancements

Potential improvements for the real-time conversation feature:
- Video support for face-to-face interviews
- Multi-language support
- Custom voice selection
- Advanced conversation analytics
- Integration with external video conferencing platforms
