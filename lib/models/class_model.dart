class Class {
  final String id;
  final String name;
  final String instructorId;
  final String description;
  final List<String> studentIds;
  final List<String> quizIds;
  final DateTime createdAt;
  final String? courseCode;
  final int semester;

  Class({
    required this.id,
    required this.name,
    required this.instructorId,
    required this.description,
    required this.studentIds,
    required this.quizIds,
    required this.createdAt,
    this.courseCode,
    required this.semester,
  });
}

class ClassReport {
  final String classId;
  final int totalStudents;
  final double averageScore;
  final Map<String, double> topicAccuracy; // topic -> accuracy %
  final List<String> classWideWeakTopics; // Topics with ≥30% error (REQ-4.4.2)
  final Map<String, dynamic> studentBreakdown;

  ClassReport({
    required this.classId,
    required this.totalStudents,
    required this.averageScore,
    required this.topicAccuracy,
    required this.classWideWeakTopics,
    required this.studentBreakdown,
  });
}
