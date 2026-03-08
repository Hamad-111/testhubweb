const functions = require("firebase-functions");
const axios = require("axios");

// TODO: For production, store this in environment variables:
// firebase functions:config:set groq.key="YOUR_API_KEY"
// const GROQ_API_KEY = functions.config().groq.key;
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-70b-8192";

async function callGroqAI(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.response ? error.response.data : error.message);
    throw new functions.https.HttpsError("internal", "Failed to call Groq AI", error.message);
  }
}

exports.extractTextFromContent = functions.https.onCall(async (data, context) => {
  const { content } = data;
  const prompt = `
Please extract and summarize the key information from the following content in a clear and concise manner:

${content}

Provide the summary in bullet points.
  `;
  return await callGroqAI(prompt);
});

exports.generateMultipleChoiceQuestions = functions.https.onCall(async (data, context) => {
  const { content, numberOfQuestions } = data;
  const prompt = `
Based on the following content, generate exactly ${numberOfQuestions} multiple-choice questions with 4 answer options each.

Content:
${content}

Provide the response in the following JSON format:
{
  "questions": [
    {
      "text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "topic": "Main topic of the question"
    }
  ]
}

Make sure:
1. Questions are clear and educational
2. Only one answer is correct (indicated by correctAnswerIndex, 0-3)
3. All options are plausible
4. Questions test comprehension, not just memorization
5. Return ONLY valid JSON, no additional text
  `;
  return await callGroqAI(prompt);
});

exports.generateTrueFalseQuestions = functions.https.onCall(async (data, context) => {
  const { content, numberOfQuestions } = data;
  const prompt = `
Based on the following content, generate exactly ${numberOfQuestions} true/false questions.

Content:
${content}

Provide the response in the following JSON format:
{
  "questions": [
    {
      "text": "Statement here?",
      "options": ["True", "False"],
      "correctAnswerIndex": 0,
      "topic": "Main topic"
    }
  ]
}

Make sure:
1. Statements are clear and unambiguous
2. Mix of true and false statements
3. Test understanding of key concepts
4. correctAnswerIndex is 0 for True, 1 for False
5. Return ONLY valid JSON, no additional text
  `;
  return await callGroqAI(prompt);
});

exports.analyzeDocument = functions.https.onCall(async (data, context) => {
  const { content } = data;
  const prompt = `
Please analyze the following document and provide:
1. Key Topics/Concepts (bullet points)
2. Important Terms and Definitions
3. Main Ideas and Summary
4. Potential Quiz Questions

Document Content:
${content}

Provide a comprehensive analysis that can be used to generate educational quiz questions.
  `;
  return await callGroqAI(prompt);
});

exports.generateQuestionsFromTemplate = functions.https.onCall(async (data, context) => {
  const { templateName, inputData } = data;
  let prompt = "";

  if (templateName === 'document_quiz_generator') {
    prompt = `
You are an expert educational content creator specializing in quiz generation.

Your task is to analyze the provided document content and generate high-quality educational quiz questions.

Document Content:
${inputData.content}

Number of Questions: ${inputData.numberOfQuestions}
Difficulty: ${inputData.difficulty || 'medium'}
Grade Level: ${inputData.gradeLevel || 'high'}

Requirements:
- Generate exactly ${inputData.numberOfQuestions} questions
- Each question must be directly related to the document content
- Provide 4 answer options (A, B, C, D) for multiple choice questions
- Mark the correct answer clearly
- Ensure questions test comprehension, not just memorization
- Use clear, concise language appropriate for the grade level
- Avoid ambiguous or trick questions

Output Format (JSON):
{
  "questions": [
    {
      "text": "What is...",
      "type": "multipleChoice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "topic": "Main topic"
    }
  ]
}
    `;
  } else if (templateName === 'topic_quiz_generator') {
    prompt = `
You are an expert educational quiz creator with deep knowledge across various subjects.

Your task is to generate engaging, educational quiz questions on the given topic.

Topic: ${inputData.topic}
Number of Questions: ${inputData.numberOfQuestions}
Difficulty: ${inputData.difficulty || 'medium'}
Grade Level: ${inputData.gradeLevel || 'high'}
${inputData.focusAreas ? 'Focus Areas: ' + inputData.focusAreas.join(', ') : ''}

Requirements:
- Generate exactly ${inputData.numberOfQuestions} questions
- Questions must be accurate and factually correct
- Cover different aspects of the topic comprehensively
- Match the specified difficulty level and grade level
- Provide 4 well-crafted answer options for multiple choice
- Ensure questions are clear and unambiguous
- Avoid questions that are too easy or too obscure

Output Format (JSON):
{
  "questions": [
    {
      "text": "What is the primary function of...",
      "type": "multipleChoice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 2,
      "topic": "Biology"
    }
  ]
}
    `;
  } else {
    throw new functions.https.HttpsError("invalid-argument", "Unknown template name");
  }

  return await callGroqAI(prompt);
});
