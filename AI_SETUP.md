# AI Interview Question Generation Setup

This document explains how to set up the Google AI integration for generating interview questions.

## Prerequisites

1. **Google AI API Key**: You need a Google AI API key to use the AI service.
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get your API key
   - Create a new API key for your project
   - Note: Google AI provides free tier with generous limits for most use cases

## Environment Setup

1. **Create Environment File**: Create a `.env` file in your project root:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
   ```

2. **Replace API Key**: Replace `your_google_ai_api_key_here` with your actual Google AI API key.

   **Note**: The Google AI SDK expects the environment variable to be named `GOOGLE_GENERATIVE_AI_API_KEY`. This is the standard environment variable name used by the `@ai-sdk/google` package.

## How It Works

### 1. Question Generation Flow
- User selects domain, difficulty level, and number of questions
- System generates a prompt using domain data, question level, and number of questions
- Google AI (Gemini) generates structured JSON response with interview questions
- Questions are automatically shuffled for randomness

### 2. Question Structure
Each generated question includes:
- **id**: Unique identifier
- **question**: The interview question text
- **type**: Question type (technical, behavioral, scenario, conceptual)
- **difficulty**: Difficulty level (easy, medium, hard)
- **category**: Relevant category name
- **expectedAnswer**: Brief expected answer or key points (optional)
- **hints**: Array of helpful hints (optional)

### 3. Question Types Distribution
- 40% Technical questions (specific to skills and languages)
- 30% Scenario-based questions (real-world problems)
- 20% Conceptual questions (understanding of principles)
- 10% Behavioral questions (soft skills and experience)

## Usage

1. **Setup Interview**: Navigate to the interview setup screen
2. **Select Preferences**: Choose difficulty level and number of questions
3. **Generate Questions**: Click "Continue" to generate questions using AI
4. **Take Interview**: Navigate through the generated questions
5. **View Results**: Complete the interview and view results

## Files Created/Modified

### New Files:
- `services/aiService.ts` - AI service for question generation
- `store/interviewThunks.ts` - Redux thunks for async operations
- `app/interview/questions.tsx` - Questions display screen
- `config/api.ts` - API configuration

### Modified Files:
- `store/interviewSlice.ts` - Added question state management
- `app/interview/index.tsx` - Integrated question generation
- `package.json` - Added required dependencies

## Dependencies Added

- `@ai-sdk/google` - Google AI SDK
- `ai` - AI SDK core
- `zod` - Schema validation

## Error Handling

The system includes comprehensive error handling:
- API key validation
- Network error handling
- User-friendly error messages
- Loading states during question generation

## Customization

You can customize the question generation by modifying:
- **Prompt template** in `services/aiService.ts`
- **Question type distribution** in the prompt
- **Schema structure** for different question formats
- **Shuffling algorithm** for question randomization

## Troubleshooting

1. **API Key Issues**: Ensure your API key is correctly set in the environment
2. **Network Errors**: Check your internet connection and API key validity
3. **Structured Output Issues**: Google AI supports structured outputs by default
4. **Question Generation Fails**: Check console logs for detailed error messages
5. **Rate Limiting**: Google AI has generous free tier limits, but check usage if issues persist
6. **Environment Variable Not Loading**: Restart your development server after changing .env file
7. **API Key Validation**: The app will show "API Key loaded from env: Yes" in console if working correctly

## Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive configuration
- The API key is only used for question generation and not stored locally
