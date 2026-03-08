'use server';

const pdf = require('pdf-parse');
import mammoth from 'mammoth';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface NoteGenerationParams {
    fileData: Buffer;
    fileName: string;
    fileType: string;
    noteType: 'summary' | 'detailed' | 'keyPoints' | 'qa';
}

export async function parseFileContent(fileData: Buffer, fileType: string): Promise<string> {
    try {
        if (fileType === 'application/pdf') {
            const data = await pdf(fileData);
            return data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: fileData });
            return result.value;
        } else if (fileType === 'text/plain') {
            return fileData.toString('utf-8');
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw new Error('Failed to parse file content');
    }
}

export async function generateNotes({ fileData, fileName, fileType, noteType }: NoteGenerationParams) {
    try {
        const textContent = await parseFileContent(fileData, fileType);

        let typeInstruction = '';
        switch (noteType) {
            case 'summary':
                typeInstruction = 'Generate a concise summary of the key concepts and findings.';
                break;
            case 'detailed':
                typeInstruction = 'Generate comprehensive, detailed notes covering all sections in depth.';
                break;
            case 'keyPoints':
                typeInstruction = 'Extract the most important key points as a bulleted list.';
                break;
            case 'qa':
                typeInstruction = 'Generate a set of study questions and detailed answers based on the content.';
                break;
        }

        const basePrompt = `
      You are an expert academic assistant. Your task is to extract and organize information from the following source material into high-quality study notes.
      
      Source Material (Title: ${fileName}):
      "${textContent.substring(0, 20000)}"
      
      Note Format Requested: ${noteType.toUpperCase()}
      Instruction: ${typeInstruction}
      
      Output Requirements:
      1. Provide the notes in structured Markdown format.
      2. Ensure all academic terms are preserved.
      3. Highlight/Bold important concepts.
      4. Include a "Key Takeaways" section at the end.
      5. Return ONLY valid JSON with the following structure:
      
      {
        "title": "Title of the notes",
        "content": "The full markdown content here",
        "keyPoints": ["Point 1", "Point 2", ...],
        "boldedTerms": ["Term 1", "Term 2", ...]
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
                temperature: 0.5,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        let jsonStr = content.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0];
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0];
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Error in generateNotes:', error);
        throw new Error('Failed to generate notes');
    }
}
