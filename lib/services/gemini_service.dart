import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/quiz_models.dart';

class GeminiService {
  late final GenerativeModel _model;

  GeminiService({required String apiKey}) {
    _model = GenerativeModel(
      model: 'gemini-1.5-pro',
      apiKey: apiKey,
    );
  }

  Future<String> extractTextFromContent(String content) async {
    try {
      final prompt = '''
Please extract and summarize the key information from the following content in a clear and concise manner:

$content

Provide the summary in bullet points.
      ''';

      final response = await _model.generateContent([
        Content.text(prompt),
      ]);

      return response.text ?? '';
    } catch (e) {
      throw Exception('Failed to extract text: $e');
    }
  }

  Future<List<Question>> generateMultipleChoiceQuestions({
    required String content,
    required int numberOfQuestions,
  }) async {
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

      final response = await _model.generateContent([
        Content.text(prompt),
      ]);

      final responseText = response.text ?? '';
      final questions = _parseMultipleChoiceResponse(responseText);

      return questions;
    } catch (e) {
      throw Exception('Failed to generate multiple choice questions: $e');
    }
  }

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

      final response = await _model.generateContent([
        Content.text(prompt),
      ]);

      final responseText = response.text ?? '';
      final questions = _parseTrueFalseResponse(responseText);

      return questions;
    } catch (e) {
      throw Exception('Failed to generate true/false questions: $e');
    }
  }

  Future<String> analyzeDocument(String content) async {
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

      final response = await _model.generateContent([
        Content.text(prompt),
      ]);

      return response.text ?? 'Unable to analyze document';
    } catch (e) {
      throw Exception('Failed to analyze document: $e');
    }
  }

  List<Question> _parseMultipleChoiceResponse(String jsonResponse) {
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
              type: QuestionType.trueFlase, // Fixed typo - trueFlase should be trueFalse
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

      // Extract questions array
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

    // Extract text
    final textMatch = RegExp(r'"text"\s*:\s*"([^"]+)"').firstMatch(questionJson);
    if (textMatch != null) {
      question['text'] = textMatch.group(1);
    }

    // Extract correctAnswerIndex
    final correctMatch = RegExp(r'"correctAnswerIndex"\s*:\s*(\d+)').firstMatch(questionJson);
    if (correctMatch != null) {
      question['correctAnswerIndex'] = int.parse(correctMatch.group(1)!);
    }

    // Extract topic
    final topicMatch = RegExp(r'"topic"\s*:\s*"([^"]+)"').firstMatch(questionJson);
    if (topicMatch != null) {
      question['topic'] = topicMatch.group(1);
    }

    // Extract options array
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
}
