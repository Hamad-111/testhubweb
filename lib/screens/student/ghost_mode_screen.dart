import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../services/firebase_quiz_service.dart';
import '../../models/quiz_models.dart'; // Corrected import
import 'play_screen.dart';
import '../../config/app_theme.dart';

class GhostModeScreen extends StatefulWidget {
  const GhostModeScreen({super.key});

  @override
  State<GhostModeScreen> createState() => _GhostModeScreenState();
}

class _GhostModeScreenState extends State<GhostModeScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();
  bool _isLoading = true;
  // This list will hold both the result and the full quiz object
  List<Map<String, dynamic>> _pastQuizzes = [];

  @override
  void initState() {
    super.initState();
    _loadPastResults();
  }

  Future<void> _loadPastResults() async {
    try {
      final currentUser = auth.FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        final results = await _quizService.getStudentResults(currentUser.uid);
        
        // Asynchronously fetch the full quiz object for each result
        final quizFutures = results.map((result) async {
          final quiz = await _quizService.getQuizByPin(result.quizId);
          return {'result': result, 'quiz': quiz};
        }).toList();

        final loadedQuizzes = await Future.wait(quizFutures);

        if (mounted) {
          setState(() {
            _pastQuizzes = loadedQuizzes.where((q) => q['quiz'] != null).toList();
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('[v0] Error loading past results: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ghost Mode - Replay'),
        backgroundColor: AppTheme.deepBrown,
        foregroundColor: AppTheme.primaryGold,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppTheme.lightCream, AppTheme.accentGold],
          ),
        ),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGold))
            : _pastQuizzes.isEmpty
            ? Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.quiz_outlined, size: 80, color: AppTheme.mediumBrown.withValues(alpha: 0.6)),
                const SizedBox(height: 20),
                const Text(
                  'No Past Quizzes',
                  style: TextStyle(
                    color: AppTheme.deepBrown,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Complete some quizzes first\nto replay them in Ghost Mode',
                  style: TextStyle(color: AppTheme.mediumBrown, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        )
            : ListView(
          padding: const EdgeInsets.all(24),
          children: _pastQuizzes.map((data) {
                final QuizResult result = data['result'];
                final Quiz quiz = data['quiz'];

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 8,
                  shadowColor: AppTheme.shadow.withValues(alpha: 0.5),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          quiz.title, // Use title from the fetched quiz object
                          style: const TextStyle(
                            color: AppTheme.deepBrown,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Previous Score:', style: TextStyle(color: AppTheme.warmBrown)),
                                Text(
                                  '${result.percentageScore?.toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    color: result.percentageScore! >= 70
                                        ? Colors.green.shade700
                                        : AppTheme.primaryGold,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('Completed:', style: TextStyle(color: AppTheme.warmBrown)),
                                Text(
                                  '${result.completedAt.day}/${result.completedAt.month}/${result.completedAt.year}',
                                  style: const TextStyle(color: AppTheme.deepBrown, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              final currentUser = auth.FirebaseAuth.instance.currentUser;
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PlayScreen(
                                    quiz: quiz,
                                    studentName: currentUser?.displayName ?? 'Student',
                                    avatar: '👻', // Ghost avatar
                                    isGhostMode: true,
                                  ),
                                ),
                              );
                            },
                            icon: const Icon(Icons.replay),
                            label: const Text('Replay Quiz'),
                            style: AppTheme.lightTheme.elevatedButtonTheme.style?.copyWith(
                              backgroundColor: WidgetStateProperty.all(AppTheme.warmBrown),
                              foregroundColor: WidgetStateProperty.all(AppTheme.white),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
        ),
      ),
    );
  }
}
