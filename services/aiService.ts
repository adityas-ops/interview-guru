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

Note: This is a practice interview session designed to help the candidate learn and improve. Be encouraging and focus on constructive feedback that will help them grow in their career.

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

1. Overall Performance Score (0-10) - Use the following scoring guidelines:
   - 9-10: Excellent - Complete, accurate, and demonstrates deep understanding
   - 8-8.9: Very Good - Mostly correct with minor gaps or areas for improvement
   - 7-7.9: Good - Generally correct with some inaccuracies or missing details
   - 6-6.9: Satisfactory - Partially correct but missing key concepts
   - 5-5.9: Below Average - Some understanding but significant gaps
   - 4-4.9: Poor - Limited understanding with major inaccuracies
   - 0-3.9: Very Poor - Incorrect or no meaningful response

2. Detailed feedback on each question with individual scores (0-10) using the same scoring scale above
3. Identify strengths and areas for improvement
4. For each question where the user struggled, provide specific learning suggestions with:
   - Topic name
   - Brief description of what to learn
   - A relevant learning URL (use reputable sources like MDN, W3Schools, official documentation, Stack Overflow, etc.)
   - A descriptive title for the URL
5. General suggestions for overall improvement

IMPORTANT SCORING GUIDELINES FOR PRACTICE INTERVIEWS:
- This is a PRACTICE interview - be encouraging and generous with scoring
- If the answer shows understanding of the core concept, give at least 7/10
- Don't penalize for minor technical details or perfect syntax
- Focus on whether the candidate understands the fundamental concepts
- If the answer is mostly correct with minor gaps, score 8-9/10
- Only give low scores (below 6) if the answer is fundamentally wrong or shows no understanding
- Consider partial credit for partially correct answers
- Reward effort and attempt to solve the problem, even if not perfect
- Remember: The goal is to encourage learning, not to be overly critical

SCORING BY QUESTION TYPE:
- Technical Questions: Score based on understanding of concepts, not perfect implementation
- Behavioral Questions: Score based on clear communication and relevant examples
- Scenario Questions: Score based on problem-solving approach and logical thinking
- Conceptual Questions: Score based on understanding of principles and ability to explain

SPECIFIC SCORING EXAMPLES:
- Correct answer with minor syntax issues: 8-9/10
- Correct approach but missing some details: 7-8/10
- Partially correct with good understanding: 6-7/10
- Wrong approach but shows some knowledge: 4-6/10
- Completely wrong or no answer: 0-3/10

BONUS SCORING FOR PRACTICE INTERVIEWS:
- If the answer is fundamentally correct, add 0.5-1 point to the score
- If the candidate shows good problem-solving thinking, add 0.5 points
- If the answer demonstrates understanding of best practices, add 0.5 points
- If the candidate shows effort to explain their reasoning, add 0.5 points

Focus on:
- Technical accuracy and depth of understanding
- Problem-solving approach
- Communication clarity
- Practical application of knowledge
- Industry best practices

For learning URLs, prioritize:
- Official documentation
- W3Schools
- Stack Overflow
- GitHub documentation
- Educational platforms like freeCodeCamp, Codecademy
- YouTube tutorials from reputable channels
- GeeksForGeeks

Remember to:
- Be encouraging and constructive in your feedback
- Highlight what the candidate did well
- Provide specific, actionable improvement suggestions
- Use a supportive tone that motivates learning
- Focus on growth and development rather than just pointing out mistakes

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
