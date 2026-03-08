import 'package:flutter/foundation.dart';
import 'package:testhub2/models/weak_topic_model..dart';
import '../models/quiz_models.dart';

class WeakTopicService extends ChangeNotifier {
  final Map<String, StudentProgress> _studentProgress = {};

  StudentProgress? getStudentProgress(String studentId) => _studentProgress[studentId];

  // REQ-4.4.1: Tag questions with topics
  // REQ-4.4.2: Weak topics if ≥30% incorrect
  void analyzeQuizResults(QuizResult result, List<Question> questions) {
    try {
      final progress = _studentProgress[result.studentId] ?? StudentProgress(
        studentId: result.studentId,
        weakTopics: [],
        topicAccuracy: {},
        totalGamesPlayed: 0,
        overallAccuracy: 0,
        lastUpdated: DateTime.now(),
      );

      // Calculate topic-wise accuracy
      Map<String, List<bool>> topicResults = {};
      for (int i = 0; i < questions.length; i++) {
        final topic = questions[i].topic ?? 'General';
        final isCorrect = result.answersGiven[i] == questions[i].correctAnswerIndex;

        topicResults.putIfAbsent(topic, () => []).add(isCorrect);
      }

      // Identify weak topics (≥30% error rate)
      List<WeakTopic> weakTopics = [];
      for (final entry in topicResults.entries) {
        final incorrect = entry.value.where((x) => !x).length;
        final errorRate = incorrect / entry.value.length;

        if (errorRate >= 0.30) {
          weakTopics.add(WeakTopic(
            topicName: entry.key,
            errorRate: errorRate,
            totalAttempts: entry.value.length,
            incorrectAttempts: incorrect,
            lastOccurrence: DateTime.now(),
            relatedQuestionIds: questions
                .where((q) => q.topic == entry.key)
                .map((q) => q.id)
                .toList(),
          ));
        }
      }

      // Update progress
      _studentProgress[result.studentId] = StudentProgress(
        studentId: result.studentId,
        weakTopics: weakTopics,
        topicAccuracy: {
          for (final entry in topicResults.entries)
            entry.key: (entry.value.where((x) => x).length / entry.value.length)
        },
        totalGamesPlayed: progress.totalGamesPlayed + 1,
        overallAccuracy: result.accuracy,
        lastUpdated: DateTime.now(),
      );

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // REQ-4.4.3: Generate adaptive notes/quiz from weak topics
  List<String> getWeakTopicsForStudent(String studentId) {
    return _studentProgress[studentId]?.weakTopics
        .map((w) => w.topicName)
        .toList() ?? [];
  }
}
