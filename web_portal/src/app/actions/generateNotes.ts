'use server';

// Polyfill for DOMMatrix which is missing in Node environments but requested by pdf-parse dependencies
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { }
    };
}

const pdf = require('pdf-parse');
import mammoth from 'mammoth';

const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface NoteGenerationParams {
    fileData: string; // Base64 string
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
    console.log(`[generateNotes] Starting for file: ${fileName}, type: ${fileType}, noteType: ${noteType}`);
    if (!GROQ_API_KEY) {
        console.error('[generateNotes] Missing GROQ_API_KEY');
        throw new Error('GROQ_API_KEY is not defined in the environment variables.');
    }
    try {
        console.log('[generateNotes] Converting base64 to buffer...');
        const buffer = Buffer.from(fileData, 'base64');
        console.log('[generateNotes] Parsing file content...');
        const textContent = await parseFileContent(buffer, fileType);
        console.log(`[generateNotes] Extracted ${textContent.length} characters`);

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
        "${textContent.substring(0, 25000)}"
        
        Note Format Requested: ${noteType.toUpperCase()}
        Instruction: ${typeInstruction}
        
        IMPORTANT: Your entire response must be a single, valid JSON object. Do not include any introductory or concluding text.
        
        JSON Structure:
        {
          "title": "A concise, descriptive title for the notes",
          "content": "The full notes in Markdown format. Use clear headings, bullet points, and bold text for key terms. CRITICAL: All newlines within this string must be escaped as \\n.",
          "keyPoints": ["A list of 5-10 most important takeaways", "..."],
          "boldedTerms": ["A list of important academic terms or names found in the notes", "..."]
        }
        
        Verify that your JSON is valid and all control characters are escaped before responding.
    `;

        console.log(`[generateNotes] Sending request to Groq API: ${GROQ_API_URL}`);
        console.log(`[generateNotes] API Key present: ${!!GROQ_API_KEY}, length: ${GROQ_API_KEY.length}`);

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
            const errorText = await response.text();
            console.error(`[generateNotes] Groq API error: ${response.status}`, errorText);
            throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
        }

        console.log('[generateNotes] Received response from Groq');
        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log('[generateNotes] Received content from Groq. Cleaning and parsing...');

        // Robust JSON extraction
        let jsonStr = content.trim();

        // Remove markdown code blocks if present
        const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            // Find the first '{' and last '}'
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                jsonStr = jsonStr.substring(start, end + 1);
            }
        }

        // Fix common AI JSON errors: unescaped newlines in string literals
        // This regex finds newlines inside quotes and escapes them
        // Note: This is a simplified approach; for complex cases, a proper parser might be needed
        const cleanedJsonStr = jsonStr.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

        // Wait, replacing ALL newlines with \n might break the JSON structure if there are newlines OUTSIDE of quotes.
        // Actually, let's just use a more targeted approach or try to parse the original first.

        try {
            console.log('[generateNotes] Primary parse attempt...');
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('[generateNotes] Primary parse failed, attempting cleanup...', e);
            // Replace literal newlines within string values (between quotes)
            // This is tricky with regex. A simpler way is to tell the AI to be more careful, 
            // BUT we can also try to escape characters that are illegal in JSON strings.
            const sanitized = jsonStr.replace(/[\u0000-\u001F]+/g, (match: string) => {
                if (match === '\n') return '\\n';
                if (match === '\r') return '\\r';
                if (match === '\t') return '\\t';
                return '';
            });

            console.log('[generateNotes] Secondary parse attempt...');
            return JSON.parse(sanitized);
        }

    } catch (error: any) {
        console.error('[generateNotes] CRITICAL ERROR:', error);
        if (error.cause) {
            console.error('[generateNotes] Error Cause:', error.cause);
        }
        if (error.stack) {
            console.error('[generateNotes] Stack Trace:', error.stack);
        }
        throw new Error(`Failed to generate notes: ${error.message}${error.cause ? ' (Cause: ' + error.cause + ')' : ''}`);
    }
}
