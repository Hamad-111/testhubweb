import 'quiz_models.dart';

class Note {
  final String id;
  final String userId;
  final String? quizId; // From quiz content
  final String? sourceFileName; // From uploaded file
  final String content; // Markdown format
  final List<String> keyPoints;
  final List<String> boldedTerms;
  final List<Question>? miniQuiz; // 3-5 questions (REQ-4.3.3)
  final DateTime createdAt;
  final DateTime? lastModified;
  final bool isPersonal;
  final String? noteType; // summary, detailed, keyPoints, qa
  final List<String> sharedWith; // User IDs

  Note({
    required this.id,
    required this.userId,
    this.quizId,
    this.sourceFileName,
    required this.content,
    required this.keyPoints,
    required this.boldedTerms,
    this.miniQuiz,
    required this.createdAt,
    this.lastModified,
    required this.isPersonal,
    this.noteType,
    required this.sharedWith,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'quizId': quizId,
      'sourceFileName': sourceFileName,
      'content': content,
      'keyPoints': keyPoints,
      'boldedTerms': boldedTerms,
      'miniQuiz': miniQuiz?.map((q) => q.toMap()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'lastModified': lastModified?.toIso8601String(),
      'isPersonal': isPersonal,
      'noteType': noteType,
      'sharedWith': sharedWith,
    };
  }

  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      quizId: map['quizId'],
      sourceFileName: map['sourceFileName'],
      content: map['content'] ?? '',
      keyPoints: List<String>.from(map['keyPoints'] ?? []),
      boldedTerms: List<String>.from(map['boldedTerms'] ?? []),
      miniQuiz: (map['miniQuiz'] as List<dynamic>?)
          ?.map((q) => Question.fromMap(q as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(map['createdAt']),
      lastModified: map['lastModified'] != null
          ? DateTime.parse(map['lastModified'])
          : null,
      isPersonal: map['isPersonal'] ?? true,
      noteType: map['noteType'],
      sharedWith: List<String>.from(map['sharedWith'] ?? []),
    );
  }
}
