import 'package:flutter/foundation.dart';
import '../models/quiz_models.dart';
import 'dart:math';

class QuizService extends ChangeNotifier {
  final List<Quiz> _quizzes = [];
  final List<LiveGameSession> _activeSessions = [];

  List<Quiz> get quizzes => _quizzes;
  List<LiveGameSession> get activeSessions => _activeSessions;

  Future<Quiz> createQuiz({
    required String title,
    required String description,
    required String instructorId,
    required List<Question> questions,
    required List<String> tags,
    String? classId,
    QuizMode mode = QuizMode.live,
  }) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    final quiz = Quiz(
      id: 'quiz_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: description,
      instructorId: instructorId,
      classId: classId,
      questions: questions,
      mode: mode,
      isPublished: false,
      createdAt: DateTime.now(),
      tags: tags,
      pin: _generatePIN(), // Generate PIN on creation for simplicity
    );

    _quizzes.add(quiz);
    notifyListeners();
    return quiz;
  }

  Quiz? getQuizByPin(String pin) {
    try {
      return _quizzes.firstWhere((quiz) => quiz.pin == pin);
    } catch (e) {
      return null;
    }
  }

  String _generatePIN() {
    return Random().nextInt(900000).toString().padLeft(6, '0');
  }

  Future<LiveGameSession> hostLiveGame(String quizId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final quiz = _quizzes.firstWhere((q) => q.id == quizId);

    final session = LiveGameSession(
      id: 'session_${DateTime.now().millisecondsSinceEpoch}',
      quizId: quizId,
      pin: quiz.pin!,
      participantIds: [],
      leaderboard: {},
      isActive: true,
      currentQuestionIndex: 0,
      startedAt: DateTime.now(),
    );

    _activeSessions.add(session);
    notifyListeners();
    return session;
  }

  Future<LiveGameSession?> joinGame(String pin, String studentId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    try {
      final session = _activeSessions.firstWhere((s) => s.pin == pin);

      if (session.participantIds.length >= 500) {
        throw Exception('Game is full');
      }

      session.participantIds.add(studentId);
      session.leaderboard[studentId] = 0;
      notifyListeners();
      return session;
    } catch (e) {
      return null;
    }
  }

  void publishQuiz(String quizId) {
    final index = _quizzes.indexWhere((q) => q.id == quizId);
    if (index != -1) {
      debugPrint('Quiz with ID $quizId is considered published.');
      notifyListeners();
    }
  }

  List<Quiz> getTeacherQuizzes(String teacherId) {
    return _quizzes.where((quiz) => quiz.instructorId == teacherId).toList();
  }

  void deleteQuiz(String pin) {
    _quizzes.removeWhere((quiz) => quiz.pin == pin);
    notifyListeners();
  }
}
