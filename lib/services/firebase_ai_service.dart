import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/quiz_models.dart';

/// Groq AI service (Client-side implementation)
/// Note: For production, it is recommended to move this to a backend to secure the API key.
class FirebaseAIService {
  final String _apiKey;
  static const String _baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  static const String _model = 'llama-3.3-70b-versatile';

  FirebaseAIService({String? apiKey})
      : _apiKey = apiKey ?? '' {
    debugPrint('[v0] 🔑 Initializing Groq AI Service (Client-side)...');
  }

  Future<String> _generateContent(String prompt) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode({
          'model': _model,
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
          'temperature': 0.7,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      } else {
        throw Exception('Groq API Error: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('[v0] ❌ Groq API error: $e');
      throw Exception('Failed to generate content: $e');
    }
  }

  /// Generate quiz questions from content
  Future<String> extractTextFromContent(String content) async {
    try {
      final prompt = '''
Please extract and summarize the key information from the following content in a clear and concise manner:

$content

Provide the summary in bullet points.
      ''';

      return await _generateContent(prompt);
    } catch (e) {
      debugPrint('[v0] ❌ Extract text error: $e');
      throw Exception('Failed to extract text: $e');
    }
  }

  /// Generate multiple choice questions
  Future<List<Question>> generateMultipleChoiceQuestions({
    required String content,
    required int numberOfQuestions,
  }) async {
    try {
      debugPrint('[v0] 🎯 Generating $numberOfQuestions multiple choice questions...');

      final prompt = '''
Based on the following content, generate exactly $numberOfQuestions multiple-choice questions with 4 answer options each.

Content:
$content

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
      ''';

      final responseText = await _generateContent(prompt);
      debugPrint('[v0] ✅ Received AI response, parsing questions...');
      final questions = _parseMultipleChoiceResponse(responseText);
      debugPrint('[v0] 📊 Successfully parsed ${questions.length} questions');

      return questions;
    } catch (e) {
      debugPrint('[v0] ❌ Generate questions error: $e');
      throw Exception('Failed to generate multiple choice questions: $e');
    }
  }

  /// Generate multiple choice questions stream (simulated)
  Stream<String> generateMultipleChoiceQuestionsStream({
    required String content,
    required int numberOfQuestions,
  }) async* {
    try {
      final prompt = '''
Based on the following content, generate exactly $numberOfQuestions multiple-choice questions with 4 answer options each.

Content:
$content

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
      ''';

      final response = await _generateContent(prompt);
      yield response;
    } catch (e) {
      throw Exception('Failed to generate questions stream: $e');
    }
  }

  /// Generate true/false questions
  Future<List<Question>> generateTrueFalseQuestions({
    required String content,
    required int numberOfQuestions,
  }) async {
    try {
      final prompt = '''
Based on the following content, generate exactly $numberOfQuestions true/false questions.

Content:
$content

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
      ''';

      final responseText = await _generateContent(prompt);
      final questions = _parseTrueFalseResponse(responseText);

      return questions;
    } catch (e) {
      throw Exception('Failed to generate true/false questions: $e');
    }
  }

  /// Analyze document content with specific note type
  Future<String> analyzeDocument(String content, {String noteType = 'summary'}) async {
    try {
      debugPrint('[v0] 🤖 Starting document analysis ($noteType)...');
      
      String prompt;
      switch (noteType) {
        case 'detailed':
          prompt = '''
Generate highly detailed, comprehensive study notes from the following text. 
Break it down into logical sections with clear headings. 
Explain complex concepts in depth. Inclusion of examples and context is essential.
Format with markdown.

Text:
$content
''';
          break;
        case 'keyPoints':
          prompt = '''
Extract the most important key points and elite takeaways from the following text.
Format as a bulleted list. 
Focus only on high-level concepts and critical facts.
Format with markdown.

Text:
$content
''';
          break;
        case 'qa':
          prompt = '''
Generate a list of challenging Q&A pairs (study questions) based on the following text.
Format as:
Q: [Question]
A: [Answer]
Ensure the questions test deep understanding, not just surface facts.
Format with markdown.

Text:
$content
''';
          break;
        case 'summary':
        default:
          prompt = '''
Provide a concise but thorough summary of the following document.
Highlight the main theme and the primary findings or ideas.
Format with markdown.

Text:
$content
''';
      }

      final response = await _generateContent(prompt);
      return response;
    } catch (e) {
      debugPrint('[v0] ❌ Document analysis error: $e');
      throw Exception('Failed to analyze document: $e');
    }
  }

  /// Analyze document stream (simulated)
  Stream<String> analyzeDocumentStream(String content) async* {
    try {
      final prompt = '''
Please analyze the following document and provide:
1. Key Topics/Concepts (bullet points)
2. Important Terms and Definitions
3. Main Ideas and Summary
4. Potential Quiz Questions

Document Content:
$content

Provide a comprehensive analysis that can be used to generate educational quiz questions.
      ''';

      final response = await _generateContent(prompt);
      yield response;
    } catch (e) {
      throw Exception('Failed to analyze document stream: $e');
    }
  }

  // Live session methods - unimplemented
  Future<void> startLiveSession({bool enableAudio = false}) async {
    throw UnimplementedError('Live API is not available.');
  }

  Future<void> sendLiveMessage(String message) async {
    throw UnimplementedError('Live API not available.');
  }

  Stream<String> receiveLiveMessages() async* {
    throw UnimplementedError('Live API not available.');
  }

  Future<void> closeLiveSession() async {
    // No-op
  }

  /// Generate quiz questions using template-based prompts
  Future<List<Question>> generateQuestionsFromPromptTemplate({
    required String templateType,
    required Map<String, dynamic> variables,
  }) async {
    try {
      String prompt;

      if (templateType == 'document_analysis') {
        prompt = _buildDocumentAnalysisPrompt(variables);
      } else if (templateType == 'topic_quiz') {
        prompt = _buildTopicQuizPrompt(variables);
      } else if (templateType == 'multiple_choice') {
        prompt = _buildMultipleChoicePrompt(variables);
      } else if (templateType == 'true_false') {
        prompt = _buildTrueFalsePrompt(variables);
      } else {
        throw Exception('Unknown template type: $templateType');
      }

      final responseText = await _generateContent(prompt);

      if (templateType == 'true_false') {
        return _parseTrueFalseResponse(responseText);
      } else {
        return _parseMultipleChoiceResponse(responseText);
      }
    } catch (e) {
      throw Exception('Failed to generate from template: $e');
    }
  }

  /// Generate quiz questions using Firebase prompt templates
  Future<List<Map<String, dynamic>>> generateQuestionsFromTemplate({
    required String templateName,
    required Map<String, dynamic> inputData,
  }) async {
    try {
      if (templateName == 'document_quiz_generator') {
        _validateDocumentQuizInput(inputData);
      } else if (templateName == 'topic_quiz_generator') {
        _validateTopicQuizInput(inputData);
      }

      String prompt = _buildPromptFromFirebaseTemplate(templateName, inputData);

      final text = await _generateContent(prompt);

      if (text.isEmpty) {
        throw Exception('Empty response from AI model');
      }

      final jsonMatch = RegExp(r'\[[\s\S]*\]').firstMatch(text);
      if (jsonMatch != null) {
        final jsonString = jsonMatch.group(0)!;
        final parsed = _parseJsonString(jsonString);
        if (parsed['questions'] is List) {
          return List<Map<String, dynamic>>.from(parsed['questions']);
        }
      }

      throw Exception('Could not parse questions from response');
    } catch (e) {
      debugPrint('Error generating questions from template: $e');
      rethrow;
    }
  }

  /// Validate document quiz generator input schema
  void _validateDocumentQuizInput(Map<String, dynamic> input) {
    if (!input.containsKey('content')) {
      throw Exception('Missing required field: content');
    }
    if (!input.containsKey('numberOfQuestions')) {
      throw Exception('Missing required field: numberOfQuestions');
    }

    final content = input['content'] as String;
    if (content.length < 100 || content.length > 50000) {
      throw Exception('content must be between 100 and 50000 characters');
    }

    final numQuestions = input['numberOfQuestions'];
    if (numQuestions < 3 || numQuestions > 20) {
      throw Exception('numberOfQuestions must be between 3 and 20');
    }

    if (input.containsKey('difficulty')) {
      final validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.contains(input['difficulty'])) {
        throw Exception('difficulty must be one of: easy, medium, hard');
      }
    }
  }

  /// Validate topic quiz generator input schema
  void _validateTopicQuizInput(Map<String, dynamic> input) {
    if (!input.containsKey('topic')) {
      throw Exception('Missing required field: topic');
    }
    if (!input.containsKey('numberOfQuestions')) {
      throw Exception('Missing required field: numberOfQuestions');
    }

    final topic = input['topic'] as String;
    if (topic.length < 3 || topic.length > 300) {
      throw Exception('topic must be between 3 and 300 characters');
    }

    final numQuestions = input['numberOfQuestions'];
    if (numQuestions < 3 || numQuestions > 50) {
      throw Exception('numberOfQuestions must be between 3 and 50');
    }

    if (input.containsKey('difficulty')) {
      final validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.contains(input['difficulty'])) {
        throw Exception('difficulty must be one of: easy, medium, hard');
      }
    }

    if (input.containsKey('gradeLevel')) {
      final validLevels = ['elementary', 'middle', 'high', 'college', 'professional'];
      if (!validLevels.contains(input['gradeLevel'])) {
        throw Exception('gradeLevel must be one of: elementary, middle, high, college, professional');
      }
    }
  }

  /// Build prompts matching Firebase template format
  String _buildPromptFromFirebaseTemplate(String templateName, Map<String, dynamic> input) {
    switch (templateName) {
      case 'document_quiz_generator':
        return '''
You are an expert educational content creator specializing in quiz generation.

Your task is to analyze the provided document content and generate high-quality educational quiz questions.

Document Content:
${input['content']}

Number of Questions: ${input['numberOfQuestions']}
Difficulty: ${input['difficulty'] ?? 'medium'}
Grade Level: ${input['gradeLevel'] ?? 'high'}

Requirements:
- Generate exactly ${input['numberOfQuestions']} questions
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
''';

      case 'topic_quiz_generator':
        return '''
You are an expert educational quiz creator with deep knowledge across various subjects.

Your task is to generate engaging, educational quiz questions on the given topic.

Topic: ${input['topic']}
Number of Questions: ${input['numberOfQuestions']}
Difficulty: ${input['difficulty'] ?? 'medium'}
Grade Level: ${input['gradeLevel'] ?? 'high'}
${input.containsKey('focusAreas') ? 'Focus Areas: ${input['focusAreas'].join(', ')}' : ''}

Requirements:
- Generate exactly ${input['numberOfQuestions']} questions
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
''';

      default:
        throw Exception('Unknown template: $templateName');
    }
  }

  List<Question> _parseMultipleChoiceResponse(String jsonResponse) {
    try {
      String jsonStr = jsonResponse.trim();

      // Check if it's the new Firebase template format with questionText
      if (jsonStr.contains('"questionText"') && jsonStr.contains('"correctAnswer"')) {
        return parseFirebaseTemplateResponse(jsonResponse);
      }

      if (jsonStr.contains('```json')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```json') + 7);
        jsonStr = jsonStr.substring(0, jsonStr.indexOf('```'));
      } else if (jsonStr.contains('```')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```') + 3);
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('```'));
      }

      jsonStr = jsonStr.trim();
      final Map<String, dynamic> json = _parseJsonString(jsonStr);
      final questions = <Question>[];

      if (json['questions'] is List) {
        for (var q in json['questions']) {
          final options = q['options'] is List
              ? List<String>.from(q['options'])
              : <String>[];

          questions.add(
            Question(
              id: DateTime.now().millisecondsSinceEpoch.toString() +
                  questions.length.toString(),
              text: q['text'].toString(),
              type: QuestionType.multipleChoice,
              options: options,
              correctAnswerIndex: q['correctAnswerIndex'] ?? 0,
              topic: q['topic']?.toString(),
              timer: const Duration(seconds: 30),
            ),
          );
        }
      }

      return questions;
    } catch (e) {
      throw Exception('Failed to parse multiple choice response: $e');
    }
  }

  List<Question> _parseTrueFalseResponse(String jsonResponse) {
    try {
      String jsonStr = jsonResponse.trim();

      if (jsonStr.contains('```json')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```json') + 7);
        jsonStr = jsonStr.substring(0, jsonStr.indexOf('```'));
      } else if (jsonStr.contains('```')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```') + 3);
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('```'));
      }

      jsonStr = jsonStr.trim();
      final Map<String, dynamic> json = _parseJsonString(jsonStr);
      final questions = <Question>[];

      if (json['questions'] is List) {
        for (var q in json['questions']) {
          final options = q['options'] is List
              ? List<String>.from(q['options'])
              : ['True', 'False'];

          questions.add(
            Question(
              id: DateTime.now().millisecondsSinceEpoch.toString() +
                  questions.length.toString(),
              text: q['text'].toString(),
              type: QuestionType.trueFlase,
              options: options,
              correctAnswerIndex: q['correctAnswerIndex'] ?? 0,
              topic: q['topic']?.toString(),
              timer: const Duration(seconds: 30),
            ),
          );
        }
      }

      return questions;
    } catch (e) {
      throw Exception('Failed to parse true/false response: $e');
    }
  }

  Map<String, dynamic> _parseJsonString(String jsonStr) {
    try {
      final startIndex = jsonStr.indexOf('{');
      final endIndex = jsonStr.lastIndexOf('}');

      if (startIndex == -1 || endIndex == -1) {
        throw FormatException('No valid JSON found');
      }

      final jsonContent = jsonStr.substring(startIndex, endIndex + 1);
      final Map<String, dynamic> result = {};

      final questionsStart = jsonContent.indexOf('"questions"');
      if (questionsStart != -1) {
        final arrayStart = jsonContent.indexOf('[', questionsStart);
        final arrayEnd = jsonContent.lastIndexOf(']');

        if (arrayStart != -1 && arrayEnd != -1) {
          final arrayContent = jsonContent.substring(arrayStart + 1, arrayEnd);
          result['questions'] = _parseQuestionsArray(arrayContent);
        }
      }

      return result;
    } catch (e) {
      return {'questions': []};
    }
  }

  List<dynamic> _parseQuestionsArray(String arrayContent) {
    final questions = <Map<String, dynamic>>[];
    var currentQuestion = '';
    var braceCount = 0;

    for (int i = 0; i < arrayContent.length; i++) {
      final char = arrayContent[i];

      if (char == '{') {
        braceCount++;
      } else if (char == '}') {
        braceCount--;
        currentQuestion += char;

        if (braceCount == 0) {
          try {
            questions.add(_parseQuestion(currentQuestion));
          } catch (e) {
            // Skip malformed questions
          }
          currentQuestion = '';
          continue;
        }
      }

      if (braceCount > 0) {
        currentQuestion += char;
      }
    }

    return questions;
  }

  Map<String, dynamic> _parseQuestion(String questionJson) {
    final question = <String, dynamic>{};

    final textMatch = RegExp(r'"text"\s*:\s*"([^"]+)"').firstMatch(questionJson);
    if (textMatch != null) {
      question['text'] = textMatch.group(1);
    }

    final correctMatch = RegExp(r'"correctAnswerIndex"\s*:\s*(\d+)').firstMatch(questionJson);
    if (correctMatch != null) {
      question['correctAnswerIndex'] = int.parse(correctMatch.group(1)!);
    }

    final topicMatch = RegExp(r'"topic"\s*:\s*"([^"]+)"').firstMatch(questionJson);
    if (topicMatch != null) {
      question['topic'] = topicMatch.group(1);
    }

    final optionsStart = questionJson.indexOf('"options"');
    if (optionsStart != -1) {
      final arrayStart = questionJson.indexOf('[', optionsStart);
      final arrayEnd = questionJson.indexOf(']', arrayStart);

      if (arrayStart != -1 && arrayEnd != -1) {
        final arrayContent = questionJson.substring(arrayStart + 1, arrayEnd);
        question['options'] = _parseOptionsArray(arrayContent);
      }
    }

    return question;
  }

  List<String> _parseOptionsArray(String arrayContent) {
    final options = <String>[];
    final optionMatches = RegExp(r'"([^"]+)"').allMatches(arrayContent);

    for (final match in optionMatches) {
      if (match.group(1) != null) {
        options.add(match.group(1)!);
      }
    }

    return options;
  }

  String _buildDocumentAnalysisPrompt(Map<String, dynamic> vars) {
    return '''
You are an expert educational content creator. Analyze this document and generate ${vars['numberOfQuestions'] ?? 10} quiz questions.

Document Content:
${vars['content']}

Difficulty Level: ${vars['difficulty'] ?? 'medium'}

Generate questions that test comprehension and understanding. Provide response in JSON format with questions array containing text, options (array of 4 choices), correctAnswerIndex (0-3), and topic fields.
''';
  }

  String _buildTopicQuizPrompt(Map<String, dynamic> vars) {
    return '''
You are an educational quiz expert. Create ${vars['numberOfQuestions'] ?? 5} engaging questions on the topic: ${vars['topic']}.

Subject: ${vars['subject'] ?? 'General Knowledge'}
Grade Level: ${vars['gradeLevel'] ?? 'high school'}

Generate clear, educational questions with 4 answer options each. Return JSON format with questions array.
''';
  }

  String _buildMultipleChoicePrompt(Map<String, dynamic> vars) {
    return '''
Based on the following content, generate exactly ${vars['numberOfQuestions'] ?? 5} multiple-choice questions with 4 answer options each.

Content:
${vars['content']}

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
''';
  }

  String _buildTrueFalsePrompt(Map<String, dynamic> vars) {
    return '''
Based on the following content, generate exactly ${vars['numberOfQuestions'] ?? 5} true/false questions.

Content:
${vars['content']}

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
''';
  }

  List<Question> parseFirebaseTemplateResponse(String jsonResponse) {
    try {
      String jsonStr = jsonResponse.trim();

      // Handle Firebase API wrapper format: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
      if (jsonStr.contains('"candidates"')) {
        final candidatesMatch = RegExp(r'"text"\s*:\s*"(.*?)"', dotAll: true).firstMatch(jsonStr);
        if (candidatesMatch != null) {
          jsonStr = candidatesMatch.group(1) ?? jsonStr;
          // Unescape the JSON string
          jsonStr = jsonStr.replaceAll(r'\"', '"')
              .replaceAll(r'\\n', '\\n')
              .replaceAll(r'\\t', '\\t');
        }
      }

      // Remove markdown code blocks if present
      if (jsonStr.contains('```json')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```json') + 7);
        jsonStr = jsonStr.substring(0, jsonStr.indexOf('```'));
      } else if (jsonStr.contains('```')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('```') + 3);
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('```'));
      }

      jsonStr = jsonStr.trim();
      final Map<String, dynamic> json = _parseJsonString(jsonStr);
      final questions = <Question>[];

      if (json['questions'] is List) {
        for (var q in json['questions']) {
          final options = q['options'] is List
              ? List<String>.from(q['options'])
              : <String>[];

          // Find correct answer index from correctAnswer string
          int correctIndex = 0;
          if (q['correctAnswer'] != null) {
            final correctAnswer = q['correctAnswer'].toString();
            correctIndex = options.indexOf(correctAnswer);
            if (correctIndex == -1) correctIndex = 0; // fallback
          }

          questions.add(
            Question(
              id: DateTime.now().millisecondsSinceEpoch.toString() +
                  questions.length.toString(),
              text: (q['questionText'] ?? q['text']).toString(),
              type: QuestionType.multipleChoice,
              options: options,
              correctAnswerIndex: correctIndex,
              topic: q['topic']?.toString(),
              timer: const Duration(seconds: 30),
            ),
          );
        }
      }

      return questions;
    } catch (e) {
      throw Exception('Failed to parse Firebase template response: $e');
    }
  }
}
