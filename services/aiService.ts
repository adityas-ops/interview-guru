import { API_CONFIG, validateApiKey } from '@/config/api';
import { DomainData } from '@/store/domainSlice';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the schema for interview questions
const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['technical', 'behavioral', 'scenario', 'conceptual']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string(),
  expectedAnswer: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

const QuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type InterviewQuestion = z.infer<typeof QuestionSchema>;

export interface QuestionGenerationParams {
  domainData: DomainData;
  questionLevel: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
}

export class AIService {
  private static instance: AIService;
  private apiKey: string;
  private googleProvider: any;

  private constructor() {
    // Get API key from configuration
    this.apiKey = API_CONFIG.GOOGLE_AI_API_KEY;
    
    // Debug logging
    console.log('AIService: API Key loaded from env:', this.apiKey ? 'Yes' : 'No');
    
    if (!validateApiKey()) {
      console.warn('Google AI API key not found. Please set EXPO_PUBLIC_GOOGLE_AI_API_KEY in your environment.');
      throw new Error('Google AI API key is not configured. Please set EXPO_PUBLIC_GOOGLE_AI_API_KEY in your environment.');
    }
    
    // Initialize Google AI provider with API key
    this.googleProvider = createGoogleGenerativeAI({
      apiKey: this.apiKey,
    });
    console.log('AIService: Google AI provider initialized successfully');
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private createPrompt(params: QuestionGenerationParams): string {
    const { domainData, questionLevel, numberOfQuestions } = params;
    
    const skillsList = domainData.skills.map(skill => skill.name).join(', ');
    const languagesList = domainData.programmingLanguages.join(', ');
    
    return `You are an expert technical interviewer. Generate ${numberOfQuestions} interview questions for a ${questionLevel} level interview in the ${domainData.field} domain.

Domain Information:
- Field: ${domainData.field}
- Experience Level: ${domainData.experience}
- Skills: ${skillsList}
- Programming Languages: ${languagesList}

Requirements:
1. Generate exactly ${numberOfQuestions} questions
2. All questions should be ${questionLevel} difficulty level
3. Mix different question types: technical, behavioral, scenario, and conceptual
4. Questions should be relevant to the specified field and skills
5. Each question should have a unique ID
6. Include appropriate category for each question
7. For technical questions, include expected answers or key points
8. For scenario questions, include hints if helpful
9. Questions should be practical and interview-ready
10. Ensure questions are shuffled and varied in approach

Question Types Distribution:
- 40% Technical questions (specific to skills and languages)
- 30% Scenario-based questions (real-world problems)
- 20% Conceptual questions (understanding of principles)
- 10% Behavioral questions (soft skills and experience)

Return the questions as a JSON array with the following structure for each question:
{
  "id": "unique_question_id",
  "question": "The interview question text",
  "type": "technical|behavioral|scenario|conceptual",
  "difficulty": "${questionLevel}",
  "category": "relevant_category_name",
  "expectedAnswer": "brief expected answer or key points (optional)",
  "hints": ["hint1", "hint2"] (optional)
}

Make sure the questions are shuffled and cover different aspects of the domain.`;
  }

  public async generateQuestions(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
    try {
      const prompt = this.createPrompt(params);
      console.log('AIService: Generating questions with prompt length:', prompt.length);
      
      const result = await generateObject({
        model: this.googleProvider('gemini-1.5-flash'),
        prompt,
        schema: QuestionsResponseSchema,
      });

      // Shuffle the questions array to ensure randomness
      const shuffledQuestions = this.shuffleArray(result.object.questions);
      
      return shuffledQuestions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions. Please try again.');
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public async generateInterviewReport(params: ReportGenerationParams): Promise<InterviewReport> {
    try {
      const { questions, userAnswers, domainData, completedAt } = params;
      
      const prompt = this.createReportPrompt(params);
      console.log('AIService: Generating interview report with prompt length:', prompt.length);
      
      const result = await generateObject({
        model: this.googleProvider('gemini-1.5-flash'),
        prompt,
        schema: InterviewReportSchema,
      });

      return result.object;
    } catch (error) {
      console.error('Error generating interview report:', error);
      throw new Error('Failed to generate interview report. Please try again.');
    }
  }

  private createReportPrompt(params: ReportGenerationParams): string {
    const { questions, userAnswers, domainData, completedAt } = params;
    
    const skillsList = domainData.skills.map(skill => skill.name).join(', ');
    const languagesList = domainData.programmingLanguages.join(', ');
    
    // Create question-answer pairs for analysis
    const qaPairs = questions.map((question, index) => {
      const userAnswer = userAnswers.find(ua => ua.question === question.question);
      return {
        question: question.question,
        type: question.type,
        difficulty: question.difficulty,
        category: question.category,
        expectedAnswer: question.expectedAnswer || '',
        userAnswer: userAnswer?.humanAnswer || 'No answer provided'
      };
    });

    return `You are an expert technical interviewer and career coach. Analyze the following interview session and provide a comprehensive report with actionable feedback and learning suggestions.

Interview Context:
- Domain: ${domainData.field}
- Experience Level: ${domainData.experience}
- Skills: ${skillsList}
- Programming Languages: ${languagesList}
- Interview Date: ${completedAt.toISOString()}
- Total Questions: ${questions.length}

Question-Answer Analysis:
${qaPairs.map((qa, index) => `
Question ${index + 1}:
- Question: ${qa.question}
- Type: ${qa.type}
- Difficulty: ${qa.difficulty}
- Category: ${qa.category}
- Expected Answer: ${qa.expectedAnswer}
- User Answer: ${qa.userAnswer}
`).join('\n')}

Please provide a comprehensive analysis including:

1. Overall Performance Score (0-10)
2. Detailed feedback on each question with individual scores (0-10)
3. Identify strengths and areas for improvement
4. For each question where the user struggled, provide specific learning suggestions with:
   - Topic name
   - Brief description of what to learn
   - A relevant learning URL (use reputable sources like MDN, W3Schools, official documentation, Stack Overflow, etc.)
   - A descriptive title for the URL
5. General suggestions for overall improvement

Focus on:
- Technical accuracy and depth of understanding
- Problem-solving approach
- Communication clarity
- Practical application of knowledge
- Industry best practices

For learning URLs, prioritize:
- Official documentation
- MDN Web Docs
- W3Schools
- Stack Overflow
- GitHub documentation
- Educational platforms like freeCodeCamp, Codecademy
- YouTube tutorials from reputable channels

Return the analysis in the specified JSON format.`;
  }
}

// Define the schema for interview reports
const ReportSuggestionSchema = z.object({
  topic: z.string(),
  description: z.string(),
  learningUrl: z.string(),
  urlTitle: z.string(),
});

const QuestionAnalysisSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
  suggestions: z.array(ReportSuggestionSchema),
});

const InterviewReportSchema = z.object({
  overallScore: z.number().min(0).max(10),
  totalQuestions: z.number(),
  completedAt: z.string(),
  overallFeedback: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  questionAnalysis: z.array(QuestionAnalysisSchema),
  generalSuggestions: z.array(ReportSuggestionSchema),
});

export type InterviewReport = z.infer<typeof InterviewReportSchema>;
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;
export type ReportSuggestion = z.infer<typeof ReportSuggestionSchema>;

export interface ReportGenerationParams {
  questions: InterviewQuestion[];
  userAnswers: { question: string; humanAnswer: string }[];
  domainData: DomainData;
  completedAt: Date;
}

export default AIService;
