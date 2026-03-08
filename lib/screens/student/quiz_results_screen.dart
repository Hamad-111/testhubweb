import 'package:flutter/material.dart';
import 'package:testhub2/models/quiz_models.dart'; // Updated import to use quiz_models.dart instead of quiz_model.dart
import 'package:testhub2/widgets/animated_card.dart';
import 'package:testhub2/screens/student/review_quiz_screen.dart';

class QuizResultsScreen extends StatefulWidget {
  final QuizResult result;

  const QuizResultsScreen({super.key, required this.result});

  @override
  State<QuizResultsScreen> createState() => _QuizResultsScreenState();
}

class _QuizResultsScreenState extends State<QuizResultsScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _confettiController.forward();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF7C4DFF), Color(0xFF2196F3)],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 30),
                  AnimatedCardWidget(
                    delay: const Duration(milliseconds: 100),
                    child: const Text(
                      'Quiz Completed! 🎉',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  AnimatedCardWidget(
                    delay: const Duration(milliseconds: 200),
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.2),
                        border: Border.all(
                          color: Colors.white,
                          width: 4,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${widget.result.score}',
                            style: const TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            '/ ${widget.result.totalQuestions}',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  AnimatedCardWidget(
                    delay: const Duration(milliseconds: 300),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _resultRow(
                            'Student Name',
                            widget.result.studentName ?? 'Unknown',
                            icon: '👤',
                          ),
                          const Divider(),
                          _resultRow(
                            'Accuracy',
                            '${widget.result.accuracy.toStringAsFixed(1)}%',
                            icon: '🎯',
                          ),
                          const Divider(),
                          _resultRow(
                            'Correct Answers',
                            '${widget.result.correctAnswers}/${widget.result.totalQuestions}',
                            icon: '✅',
                          ),
                          const Divider(),
                          _resultRow(
                            'Wrong Answers',
                            '${widget.result.wrongAnswers}/${widget.result.totalQuestions}',
                            icon: '❌',
                          ),
                          const Divider(),
                          _resultRow(
                            'Your Rank',
                            '#${widget.result.rank}',
                            icon: '🏆',
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  AnimatedCardWidget(
                    delay: const Duration(milliseconds: 400),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 2,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Your Performance',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                  CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Accuracy',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.white70,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    ClipRRect(
                                      borderRadius:
                                      BorderRadius.circular(10),
                                      child:
                                      LinearProgressIndicator(
                                        value: widget.result
                                            .accuracy /
                                            100,
                                        minHeight: 8,
                                        backgroundColor: Colors
                                            .white
                                            .withValues(alpha: 0.2),
                                        valueColor:
                                        AlwaysStoppedAnimation<
                                            Color>(
                                          widget.result.accuracy >=
                                              80
                                              ? Colors.green
                                              : widget.result
                                              .accuracy >=
                                              60
                                              ? Colors.orange
                                              : Colors.red,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  AnimatedCardWidget(
                    delay: const Duration(milliseconds: 500),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator
                                  .pushNamedAndRemoveUntil(
                                context,
                                '/student_dashboard',
                                    (route) => false,
                              );
                            },
                            style:
                            ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor:
                              const Color(0xFF7C4DFF),
                              minimumSize: const Size(
                                  double.infinity, 50),
                              shape:
                              RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Back to Dashboard',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ReviewQuizScreen(result: widget.result),
                                ),
                              );
                            },
                            style:
                            ElevatedButton.styleFrom(
                              backgroundColor: Colors.white
                                  .withValues(alpha: 0.3),
                              foregroundColor: Colors.white,
                              minimumSize: const Size(
                                  double.infinity, 50),
                              shape:
                              RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(12),
                                side: const BorderSide(
                                  color: Colors.white,
                                  width: 2,
                                ),
                              ),
                            ),
                            child: const Text(
                              'Review Answers',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _resultRow(String label, String value,
      {String? icon}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              if (icon != null) ...[
                Text(
                  icon,
                  style: const TextStyle(fontSize: 20),
                ),
                const SizedBox(width: 12),
              ],
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF6B7280),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }
}
