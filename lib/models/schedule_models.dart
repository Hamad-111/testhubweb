import 'package:flutter/material.dart';

class Class {
  final String id;
  final String name;
  final String subject;
  final String teacher;
  final String room;
  final TimeOfDay startTime;
  final TimeOfDay endTime;
  final List<String> days;
  final Color color;

  Class({
    required this.id,
    required this.name,
    required this.subject,
    required this.teacher,
    required this.room,
    required this.startTime,
    required this.endTime,
    required this.days,
    required this.color,
  });
}

class Subject {
  final String id;
  final String name;
  final String code;
  final String teacher;
  final int creditHours;
  final double progress;
  final List<String> topics;
  final Color color;
  final String icon;

  Subject({
    required this.id,
    required this.name,
    required this.code,
    required this.teacher,
    required this.creditHours,
    required this.progress,
    required this.topics,
    required this.color,
    required this.icon,
  });
}

class Exam {
  final String id;
  final String name;
  final String subject;
  final DateTime date;
  final TimeOfDay startTime;
  final Duration duration;
  final String location;
  final int totalMarks;
  final bool isMidterm;
  final Color color;

  Exam({
    required this.id,
    required this.name,
    required this.subject,
    required this.date,
    required this.startTime,
    required this.duration,
    required this.location,
    required this.totalMarks,
    required this.isMidterm,
    required this.color,
  });

  bool get isUpcoming => date.isAfter(DateTime.now());

  Duration get timeRemaining {
    final now = DateTime.now();
    final examStartDateTime = DateTime(
      date.year,
      date.month,
      date.day,
      startTime.hour,
      startTime.minute,
    );
    if (examStartDateTime.isBefore(now)) {
      return Duration.zero;
    }
    return examStartDateTime.difference(now);
  }
}
