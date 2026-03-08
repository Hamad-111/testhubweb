'use server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface QuizGenerationParams {
    topic: string;
    difficulty: string;
    questionCount: number;
    contextData?: string;
}

export async function generateQuizQuestions({ topic, difficulty, questionCount, contextData }: QuizGenerationParams) {
    try {
        const basePrompt = `
      You are an expert educational quiz creator. Create ${questionCount} engaging questions.
      
      Topic: "${topic}"
      Difficulty Level: ${difficulty}
      
      ${contextData ? `IMPORTANT: Generate the questions based strictly on the following source material:\n"${contextData.substring(0, 15000)}"` : `Generate clear, educational questions based on your general knowledge.`}
      
      Generate clear, educational questions with 4 answer options each.
      
      Requirements:
      1. Generate exactly ${questionCount} questions
      2. Questions must be accurate and factually correct
      3. Provide 4 answer options (A, B, C, D)
      4. Mark the correct answer clearly (index 0-3)
      5. Return ONLY valid JSON, no markdown formatting or other text.

      Output Format (JSON):
      {
        "questions": [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
          }
        ]
      }
    `;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'user', content: basePrompt }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Clean up content if it contains markdown code blocks
        let jsonStr = content.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0];
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0];
        }

        const parsedData = JSON.parse(jsonStr);
        return parsedData.questions;

    } catch (error) {
        console.error('Error in generateQuizQuestions:', error);
        throw new Error('Failed to generate quiz questions');
    }
}
