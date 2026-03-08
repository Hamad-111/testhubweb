import 'package:flutter/material.dart';
import '../models/schedule_models.dart';

class ScheduleService {
  static final List<Class> _classes = [];
  static final List<Subject> _subjects = [];
  static final List<Exam> _exams = [];

  static List<Class> getClasses() => _classes;
  static List<Subject> getSubjects() => _subjects;
  static List<Exam> getExams() => _exams;

  static List<Class> getClassesToday() {
    final today = DateTime.now();
    final dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][today.weekday - 1];
    return _classes.where((c) => c.days.contains(dayName)).toList();
  }

  static List<Exam> getUpcomingExams() {
    return _exams.where((e) => e.isUpcoming).toList()..sort((a, b) => a.date.compareTo(b.date));
  }
}
