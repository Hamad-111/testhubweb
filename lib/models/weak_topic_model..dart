class WeakTopic {
  final String topicName;
  final double errorRate; // % of incorrect answers
  final int totalAttempts;
  final int incorrectAttempts;
  final DateTime lastOccurrence;
  final List<String> relatedQuestionIds;

  WeakTopic({
    required this.topicName,
    required this.errorRate,
    required this.totalAttempts,
    required this.incorrectAttempts,
    required this.lastOccurrence,
    required this.relatedQuestionIds,
  });

  bool isWeak() => errorRate >= 0.30; // ≥30% error rate (REQ-4.4.2)
}

class StudentProgress {
  final String studentId;
  final List<WeakTopic> weakTopics;
  final Map<String, double> topicAccuracy; // topic -> accuracy %
  final int totalGamesPlayed;
  final double overallAccuracy;
  final DateTime lastUpdated;

  StudentProgress({
    required this.studentId,
    required this.weakTopics,
    required this.topicAccuracy,
    required this.totalGamesPlayed,
    required this.overallAccuracy,
    required this.lastUpdated,
  });
}
