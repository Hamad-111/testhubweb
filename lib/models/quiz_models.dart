import 'package:cloud_firestore/cloud_firestore.dart';

enum QuestionType { multipleChoice, trueFlase, shortAnswer, essay }
enum QuizMode { live, selfPaced }

class Question {
  final String id;
  final String text;
  final QuestionType type;
  final List<String> options;
  final int correctAnswerIndex;
  final String? topic;
  final Duration? timer;
  final String? imageUrl;
  final String? videoUrl;

  Question({
    required this.id,
    required this.text,
    required this.type,
    required this.options,
    required this.correctAnswerIndex,
    this.topic,
    this.timer = const Duration(seconds: 30),
    this.imageUrl,
    this.videoUrl,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'text': text,
      'type': type.name,
      'options': options,
      'correctAnswerIndex': correctAnswerIndex,
      'topic': topic,
      'timer': timer?.inSeconds,
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
    };
  }

  factory Question.fromMap(Map<String, dynamic> map) {
    return Question(
      id: map['id'] ?? '',
      text: map['text'] ?? '',
      type: QuestionType.values.firstWhere(
            (e) => e.name == map['type'],
        orElse: () => QuestionType.multipleChoice,
      ),
      options: List<String>.from(map['options'] ?? []),
      correctAnswerIndex: (map['correctAnswerIndex'] as num?)?.toInt() ?? 0,
      topic: map['topic'],
      timer: map['timer'] != null ? Duration(seconds: (map['timer'] as num).toInt()) : const Duration(seconds: 30),
      imageUrl: map['imageUrl'],
      videoUrl: map['videoUrl'],
    );
  }
}

class Quiz {
  final String id;
  final String title;
  final String description;
  final String instructorId;
  final String? classId;
  final List<Question> questions;
  final QuizMode mode;
  final Duration? totalTime;
  final String? pin;
  final int maxPlayers;
  final bool isPublished;
  final DateTime createdAt;
  final DateTime? publishedAt;
  final List<String> tags;
  final int participantCount;
  final int timePerQuestion;
  final String? topic;

  Quiz({
    required this.id,
    required this.title,
    required this.description,
    required this.instructorId,
    this.classId,
    required this.questions,
    required this.mode,
    this.totalTime,
    this.pin,
    this.maxPlayers = 500,
    required this.isPublished,
    required this.createdAt,
    this.publishedAt,
    required this.tags,
    this.participantCount = 0,
    this.timePerQuestion = 30,
    this.topic,
  });

  int get totalQuestions => questions.length;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'instructorId': instructorId,
      'classId': classId,
      'questions': questions.map((q) => q.toMap()).toList(),
      'mode': mode.name,
      'totalTime': totalTime?.inSeconds,
      'pin': pin,
      'maxPlayers': maxPlayers,
      'isPublished': isPublished,
      'createdAt': createdAt.toIso8601String(),
      'publishedAt': publishedAt?.toIso8601String(),
      'tags': tags,
      'participantCount': participantCount,
      'timePerQuestion': timePerQuestion,
      'topic': topic,
    };
  }

  factory Quiz.fromMap(Map<String, dynamic> map) {
    return Quiz(
      id: map['id'] ?? map['pin'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      instructorId: map['instructorId'] ?? '',
      classId: map['classId'],
      questions: (map['questions'] as List<dynamic>?)
          ?.map((q) => Question.fromMap(q as Map<String, dynamic>))
          .toList() ??
          [],
      mode: map['mode'] != null 
          ? QuizMode.values.firstWhere(
              (e) => e.name == map['mode'],
              orElse: () => QuizMode.selfPaced,
            )
          : QuizMode.selfPaced,
      totalTime: map['totalTime'] != null ? Duration(seconds: (map['totalTime'] as num).toInt()) : null,
      pin: map['pin'],
      maxPlayers: (map['maxPlayers'] as num?)?.toInt() ?? 500,
      isPublished: map['isPublished'] ?? false,
      createdAt: map['createdAt'] == null
          ? DateTime.now()
          : (map['createdAt'] is String
              ? DateTime.parse(map['createdAt'])
              : (map['createdAt'] as Timestamp).toDate()),
      publishedAt: map['publishedAt'] == null
          ? null
          : (map['publishedAt'] is String
              ? DateTime.parse(map['publishedAt'])
              : (map['publishedAt'] as Timestamp).toDate()),
      tags: List<String>.from(map['tags'] ?? []),
      participantCount: (map['participantCount'] as num?)?.toInt() ?? 0,
      timePerQuestion: (map['timePerQuestion'] as num?)?.toInt() ?? 30,
      topic: map['topic'],
    );
  }
}

class QuizResult {
  final String id;
  final String quizId;
  final String studentId;
  final String? studentName;
  final String? studentEmail;
  final String? avatar;
  final int score;
  final int totalQuestions;
  final int? correctAnswers;
  final int? wrongAnswers;
  final double accuracy;
  final List<int> answersGiven;
  final Duration timeTaken;
  final int? totalTime;
  final DateTime completedAt;
  final List<String> weakTopics;
  final List<QuestionResult>? questionResults;
  final String? quizTitle;
  final double? percentageScore;
  final int? rank;

  QuizResult({
    required this.id,
    required this.quizId,
    required this.studentId,
    this.studentName,
    this.studentEmail,
    this.avatar,
    required this.score,
    required this.totalQuestions,
    this.correctAnswers,
    this.wrongAnswers,
    required this.accuracy,
    required this.answersGiven,
    required this.timeTaken,
    this.totalTime,
    required this.completedAt,
    required this.weakTopics,
    this.questionResults,
    this.quizTitle,
    this.percentageScore,
    this.rank,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'quizId': quizId,
      'studentId': studentId,
      'studentName': studentName,
      'studentEmail': studentEmail,
      'avatar': avatar,
      'score': score,
      'totalQuestions': totalQuestions,
      'correctAnswers': correctAnswers,
      'wrongAnswers': wrongAnswers,
      'accuracy': accuracy,
      'answersGiven': answersGiven,
      'timeTaken': timeTaken.inSeconds,
      'totalTime': totalTime,
      'completedAt': completedAt.toIso8601String(),
      'weakTopics': weakTopics,
      'questionResults': questionResults?.map((qr) => qr.toMap()).toList(),
      'quizTitle': quizTitle,
      'percentageScore': percentageScore,
      'rank': rank,
    };
  }

  factory QuizResult.fromMap(Map<String, dynamic> map) {
    return QuizResult(
      id: map['id'] ?? '',
      quizId: map['quizId'] ?? '',
      studentId: map['studentId'] ?? '',
      studentName: map['studentName'],
      studentEmail: map['studentEmail'],
      avatar: map['avatar'],
      score: (map['score'] as num?)?.toInt() ?? 0,
      totalQuestions: (map['totalQuestions'] as num?)?.toInt() ?? 0,
      correctAnswers: (map['correctAnswers'] as num?)?.toInt(),
      wrongAnswers: (map['wrongAnswers'] as num?)?.toInt(),
      accuracy: (map['accuracy'] as num?)?.toDouble() ?? 0.0,
      answersGiven: (map['answersGiven'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          [],
      timeTaken: Duration(seconds: (map['timeTaken'] as num?)?.toInt() ?? 0),
      totalTime: (map['totalTime'] as num?)?.toInt(),
      completedAt: map['completedAt'] is Timestamp
          ? (map['completedAt'] as Timestamp).toDate()
          : DateTime.tryParse(map['completedAt'].toString()) ?? DateTime.now(),
      weakTopics: List<String>.from(map['weakTopics'] ?? []),
      quizTitle: map['quizTitle'],
      percentageScore: (map['percentageScore'] as num?)?.toDouble(),
      rank: (map['rank'] as num?)?.toInt(),
    );
  }
}

class QuestionResult {
  final String questionId;
  final int selectedAnswerIndex;
  final int correctAnswerIndex;
  final bool isCorrect;
  final int timeSpent;

  QuestionResult({
    required this.questionId,
    required this.selectedAnswerIndex,
    required this.correctAnswerIndex,
    required this.isCorrect,
    required this.timeSpent,
  });

  Map<String, dynamic> toMap() {
    return {
      'questionId': questionId,
      'selectedAnswerIndex': selectedAnswerIndex,
      'correctAnswerIndex': correctAnswerIndex,
      'isCorrect': isCorrect,
      'timeSpent': timeSpent,
    };
  }

  factory QuestionResult.fromMap(Map<String, dynamic> map) {
    return QuestionResult(
      questionId: map['questionId'] ?? '',
      selectedAnswerIndex: map['selectedAnswerIndex'] ?? 0,
      correctAnswerIndex: map['correctAnswerIndex'] ?? 0,
      isCorrect: map['isCorrect'] ?? false,
      timeSpent: map['timeSpent'] ?? 0,
    );
  }
}

class LiveGameSession {
  final String id;
  final String quizId;
  final String pin;
  final List<String> participantIds;
  final Map<String, int> leaderboard;
  final bool isActive;
  final int currentQuestionIndex;
  final DateTime startedAt;
  final DateTime? endedAt;

  LiveGameSession({
    required this.id,
    required this.quizId,
    required this.pin,
    required this.participantIds,
    required this.leaderboard,
    required this.isActive,
    required this.currentQuestionIndex,
    required this.startedAt,
    this.endedAt,
  });
}
