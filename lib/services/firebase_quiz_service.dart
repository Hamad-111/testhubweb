import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../models/quiz_models.dart';

class FirebaseQuizService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<String> createQuiz(Quiz quiz) async {
    try {
      String pin = await _generateUniquePIN();

      final quizData = quiz.toMap();
      quizData['pin'] = pin;
      quizData['participantCount'] = 0;
      quizData['isPublished'] = true; // Ensure quiz is published
      quizData['createdAt'] = FieldValue.serverTimestamp();
      quizData['publishedAt'] = FieldValue.serverTimestamp();

      // Create document with PIN as ID for easy lookup
      await _firestore.collection('quizzes').doc(pin).set(quizData);

      debugPrint('[v0] Quiz created successfully with PIN: $pin');
      return pin;
    } catch (e) {
      debugPrint('[v0] Create quiz error: $e');
      rethrow;
    }
  }

  Future<String> _generateUniquePIN() async {
    while (true) {
      final pin = (100000 + DateTime.now().microsecond % 900000).toString();

      // Check if PIN already exists
      final existingQuiz = await getQuizByPin(pin);
      if (existingQuiz == null) {
        return pin;
      }
    }
  }

  Future<Quiz?> getQuizByPin(String pin) async {
    try {
      debugPrint('[v0] Looking up quiz with PIN: $pin');
      final doc = await _firestore.collection('quizzes').doc(pin).get();

      if (doc.exists && doc.data() != null) {
        debugPrint('[v0] Quiz found for PIN: $pin');
        return Quiz.fromMap(doc.data()!);
      }
      debugPrint('[v0] No quiz found for PIN: $pin');
      return null;
    } catch (e) {
      debugPrint('[v0] Get quiz by PIN error: $e');
      return null;
    }
  }

  Stream<List<Quiz>> getTeacherQuizzesStream(String instructorId) {
    return _firestore
        .collection('quizzes')
        .where('instructorId', isEqualTo: instructorId)
        .snapshots()
        .map((snapshot) {
      final quizzes = snapshot.docs.map((doc) {
        try {
          return Quiz.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing quiz: $e');
          return null;
        }
      }).whereType<Quiz>().toList();

      // Sort in memory by createdAt descending
      quizzes.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      return quizzes;
    });
  }

  // Get quizzes by instructor (for initial load)
  Future<List<Quiz>> getTeacherQuizzes(String instructorId) async {
    try {
      final querySnapshot = await _firestore
          .collection('quizzes')
          .where('instructorId', isEqualTo: instructorId)
          .get();

      final quizzes = querySnapshot.docs.map((doc) {
        try {
          return Quiz.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing quiz: $e');
          return null;
        }
      }).whereType<Quiz>().toList();

      // Sort in memory by createdAt descending
      quizzes.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      return quizzes;
    } catch (e) {
      debugPrint('[v0] Get teacher quizzes error: $e');
      return [];
    }
  }

  Future<void> saveQuizResult(QuizResult result) async {
    try {
      final resultData = result.toMap();
      resultData['completedAt'] = FieldValue.serverTimestamp();
      resultData['instructorId'] = await _getQuizInstructorId(result.quizId);

      await _firestore.collection('quiz_results').add(resultData);

      // Update participant count
      final quiz = await getQuizByPin(result.quizId);
      if (quiz != null) {
        await _firestore
            .collection('quizzes')
            .where('pin', isEqualTo: result.quizId)
            .limit(1)
            .get()
            .then((snapshot) {
          if (snapshot.docs.isNotEmpty) {
            snapshot.docs.first.reference.update({
              'participantCount': FieldValue.increment(1),
            });
          }
        });
      }
      
      // Update student's total score and quizzes taken count
      if (result.studentId.isNotEmpty) {
        final userRef = _firestore.collection('users').doc(result.studentId);
        await userRef.update({
          'totalScore': FieldValue.increment(result.score),
          'quizzesTaken': FieldValue.increment(1),
        });
      }

      debugPrint('[v0] Quiz result saved successfully');
    } catch (e) {
      debugPrint('[v0] Save result error: $e');
      rethrow;
    }
  }

  Future<String?> _getQuizInstructorId(String quizId) async {
    try {
      final quiz = await getQuizByPin(quizId);
      return quiz?.instructorId;
    } catch (e) {
      return null;
    }
  }

  Stream<List<QuizResult>> getStudentResultsStream(String studentId) {
    return _firestore
        .collection('quiz_results')
        .where('studentId', isEqualTo: studentId)
        .snapshots()
        .map((snapshot) {
      final results = snapshot.docs.map((doc) {
        try {
          return QuizResult.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing result: $e');
          return null;
        }
      }).whereType<QuizResult>().toList();

      results.sort((a, b) => b.completedAt.compareTo(a.completedAt));
      return results;
    });
  }

  // Get student results (for initial load)
  Future<List<QuizResult>> getStudentResults(String studentId) async {
    try {
      debugPrint('[v0] Fetching quiz results for student: $studentId');

      final querySnapshot = await _firestore
          .collection('quiz_results')
          .where('studentId', isEqualTo: studentId)
          .get();

      final results = querySnapshot.docs.map((doc) {
        try {
          return QuizResult.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing result: $e');
          return null;
        }
      }).whereType<QuizResult>().toList();

      results.sort((a, b) => b.completedAt.compareTo(a.completedAt));

      debugPrint('[v0] Found ${results.length} quiz results');
      return results;
    } catch (e) {
      debugPrint('[v0] Get student results error: $e');
      return [];
    }
  }

  Future<void> deleteQuiz(String pin) async {
    try {
      final querySnapshot = await _firestore
          .collection('quizzes')
          .where('pin', isEqualTo: pin)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        await querySnapshot.docs.first.reference.delete();
        debugPrint('[v0] Quiz deleted successfully');
      }
    } catch (e) {
      debugPrint('[v0] Delete quiz error: $e');
      rethrow;
    }
  }

  Stream<List<Quiz>> getActiveQuizzesStream() {
    return _firestore
        .collection('quizzes')
        .where('isPublished', isEqualTo: true)
        .limit(20)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        try {
          return Quiz.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing quiz: $e');
          return null;
        }
      }).whereType<Quiz>().toList();
    });
  }

  Future<void> publishQuiz(String pin) async {
    try {
      final querySnapshot = await _firestore
          .collection('quizzes')
          .where('pin', isEqualTo: pin)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        await querySnapshot.docs.first.reference.update({
          'isPublished': true,
          'publishedAt': FieldValue.serverTimestamp(),
        });
        debugPrint('[v0] Quiz published successfully');
      }
    } catch (e) {
      debugPrint('[v0] Publish quiz error: $e');
      rethrow;
    }
  }

  Future<void> stopQuiz(String pin) async {
    try {
      final querySnapshot = await _firestore
          .collection('quizzes')
          .where('pin', isEqualTo: pin)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        await querySnapshot.docs.first.reference.update({
          'isPublished': false,
        });
        debugPrint('[v0] Quiz stopped successfully');
      }
    } catch (e) {
      debugPrint('[v0] Stop quiz error: $e');
      rethrow;
    }
  }
  Future<Quiz?> getQuizById(String quizId) async {
    try {
      // First try to find by ID
      DocumentSnapshot doc = await _firestore.collection('quizzes').doc(quizId).get();
      
      if (doc.exists) {
        return Quiz.fromMap(doc.data() as Map<String, dynamic>);
      }
      
      // If not found by ID (maybe quizId in result is actually the PIN, depending on implementation),
      // try searching by PIN
      final querySnapshot = await _firestore
          .collection('quizzes')
          .where('pin', isEqualTo: quizId)
          .limit(1)
          .get();

      if (querySnapshot.docs.isNotEmpty) {
        return Quiz.fromMap(querySnapshot.docs.first.data());
      }

      return null;
    } catch (e) {
      debugPrint('[v0] Get quiz by ID error: $e');
      return null;
    }
  }

  Future<List<QuizResult>> getQuizResults(String quizId) async {
    try {
      final querySnapshot = await _firestore
          .collection('quiz_results')
          .where('quizId', isEqualTo: quizId)
          .get();

      final results = querySnapshot.docs.map((doc) {
        try {
          return QuizResult.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing result: $e');
          return null;
        }
      }).whereType<QuizResult>().toList();

      // Sort by score descending
      results.sort((a, b) => b.score.compareTo(a.score));
      return results;
    } catch (e) {
      debugPrint('[v0] Get quiz results error: $e');
      return [];
    }
  }

  Stream<List<QuizResult>> getQuizResultsStream(String quizId) {
    if (quizId.isEmpty) {
      return Stream.value([]);
    }
    return _firestore
        .collection('quiz_results')
        .where('quizId', isEqualTo: quizId)
        .snapshots()
        .map((snapshot) {
      final results = snapshot.docs.map((doc) {
        try {
          return QuizResult.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing result: $e');
          return null;
        }
      }).whereType<QuizResult>().toList();

      // Sort by score descending
      results.sort((a, b) => b.score.compareTo(a.score));
      return results;
    });
  }
  Stream<List<Quiz>> getQuizzesByTopicStream(String topic) {
    Query query = _firestore.collection('quizzes').where('isPublished', isEqualTo: true);

    if (topic != 'All') {
      query = query.where('topic', isEqualTo: topic);
    }

    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        try {
          return Quiz.fromMap(doc.data() as Map<String, dynamic>);
        } catch (e) {
          debugPrint('[v0] Error parsing quiz: $e');
          return null;
        }
      }).whereType<Quiz>().toList();
    });
  }
  Stream<List<QuizResult>> getTeacherResultsStream(String instructorId) {
    return _firestore
        .collection('quiz_results')
        .where('instructorId', isEqualTo: instructorId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        try {
          return QuizResult.fromMap(doc.data());
        } catch (e) {
          debugPrint('[v0] Error parsing result: $e');
          return null;
        }
      }).whereType<QuizResult>().toList();
    });
  }
}
