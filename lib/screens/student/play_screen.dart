import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../services/firebase_quiz_service.dart';
import '../../models/quiz_models.dart';
import 'quiz_results_screen.dart';

class PlayScreen extends StatefulWidget {
  final Quiz quiz;
  final String studentName;
  final String avatar;
  final bool isGhostMode;

  const PlayScreen({
    super.key,
    required this.quiz,
    required this.studentName,
    required this.avatar,
    this.isGhostMode = false,
  });

  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  late int currentQuestionIndex;
  late int timeRemaining;
  late int totalScore;
  late int correctAnswers;
  late List<QuestionResult> questionResults;
  late Map<int, int> selectedAnswers;
  final FirebaseQuizService _quizService = FirebaseQuizService();

  bool showFeedback = false;
  bool isCorrect = false;

  @override
  void initState() {
    super.initState();
    currentQuestionIndex = 0;
    timeRemaining = widget.quiz.timePerQuestion;
    totalScore = 0;
    correctAnswers = 0;
    questionResults = [];
    selectedAnswers = {};
    _startTimer();
  }

  void _startTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        if (timeRemaining > 0) {
          setState(() => timeRemaining--);
          _startTimer();
        } else if (!showFeedback) {
          // Timeout occurred and feedback isn't already showing
          setState(() {
            showFeedback = true;
            isCorrect = false;
          });
          
          // Show "Time's up" SnackBar
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Time is up! Showing correct answer...'),
              backgroundColor: Colors.orange,
              duration: Duration(milliseconds: 800),
            ),
          );

          // Wait 1 second to show the correct answer before jumping
          Future.delayed(const Duration(seconds: 1), () {
            if (mounted) {
              _handleNextQuestion();
            }
          });
        }
      }
    });
  }

  void _handleNextQuestion() {
    // Reset feedback states for the next question
    setState(() {
      showFeedback = false;
      isCorrect = false;
    });

    if (selectedAnswers[currentQuestionIndex] != null) {
      final question = widget.quiz.questions[currentQuestionIndex];
      final selectedIndex = selectedAnswers[currentQuestionIndex]!;
      final isAnswerCorrect = selectedIndex == question.correctAnswerIndex;

      questionResults.add(
        QuestionResult(
          questionId: question.id,
          selectedAnswerIndex: selectedIndex,
          correctAnswerIndex: question.correctAnswerIndex,
          isCorrect: isAnswerCorrect,
          timeSpent: widget.quiz.timePerQuestion - timeRemaining,
        ),
      );

      if (isAnswerCorrect) {
        correctAnswers++;
        totalScore++;
      }
    }

    if (currentQuestionIndex < widget.quiz.questions.length - 1) {
      setState(() {
        currentQuestionIndex++;
        timeRemaining = widget.quiz.timePerQuestion;
        showFeedback = false;
      });
    } else {
      _completeQuiz();
    }
  }

  void _completeQuiz() async {
    final weakTopics = <String>[];
    for (var qResult in questionResults) {
      if (!qResult.isCorrect) {
        final question = widget.quiz.questions.firstWhere(
              (q) => q.id == qResult.questionId,
        );
        if (question.topic != null && !weakTopics.contains(question.topic)) {
          weakTopics.add(question.topic!);
        }
      }
    }

    final currentUser = auth.FirebaseAuth.instance.currentUser;
    final accuracy = (correctAnswers / widget.quiz.totalQuestions * 100).toDouble();

    final result = QuizResult(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      quizId: widget.quiz.pin ?? widget.quiz.id,
      studentId: currentUser?.uid ?? '',
      studentName: widget.studentName,
      studentEmail: currentUser?.email,
      avatar: widget.avatar,
      totalQuestions: widget.quiz.totalQuestions,
      correctAnswers: correctAnswers,
      wrongAnswers: widget.quiz.totalQuestions - correctAnswers,
      score: totalScore,
      percentageScore: accuracy,
      accuracy: accuracy,
      timeTaken: Duration(seconds: widget.quiz.timePerQuestion * widget.quiz.totalQuestions - timeRemaining),
      totalTime: widget.quiz.timePerQuestion * widget.quiz.totalQuestions,
      completedAt: DateTime.now(),
      answersGiven: selectedAnswers.values.toList(),
      weakTopics: weakTopics,
      questionResults: questionResults,
      quizTitle: widget.quiz.title,
    );

    if (!widget.isGhostMode && currentUser != null) {
      try {
        await _quizService.saveQuizResult(result);
        debugPrint('[v0] Quiz result saved to Firebase successfully');
      } catch (e) {
        debugPrint('[v0] Error saving quiz result: $e');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Warning: Could not save results: $e'),
              backgroundColor: Colors.orange,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    }

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => QuizResultsScreen(
            result: result,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.quiz.questions[currentQuestionIndex];
    final isAnswered = selectedAnswers[currentQuestionIndex] != null;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF7C4DFF), Color(0xFF2196F3)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Exit Quiz?'),
                            content: const Text(
                              'Are you sure you want to exit? Your progress will be lost.',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () =>
                                    Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  Navigator.pop(context);
                                },
                                child: const Text('Exit'),
                              ),
                            ],
                          ),
                        );
                      },
                      child: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.3),
                            width: 2,
                          ),
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text(
                          'Quiz Time',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Q${currentQuestionIndex + 1}/${widget.quiz.totalQuestions}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      width: 60,
                      height: 50,
                      decoration: BoxDecoration(
                        color: timeRemaining <= 10
                            ? Colors.red.withValues(alpha: 0.3)
                            : Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: timeRemaining <= 10
                              ? Colors.red.withValues(alpha: 0.5)
                              : Colors.white.withValues(alpha: 0.3),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          '00:${timeRemaining.toString().padLeft(2, '0')}',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: timeRemaining <= 10
                                ? Colors.red
                                : Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: (currentQuestionIndex + 1) /
                        widget.quiz.totalQuestions,
                    minHeight: 8,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    valueColor:
                    const AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Text(
                          question.text,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                      GridView.count(
                        crossAxisCount: 2,
                        mainAxisSpacing: 15,
                        crossAxisSpacing: 15,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: List.generate(
                          question.options.length,
                              (index) => _buildAnswerOption(
                            index,
                            question.options[index],
                            showFeedback,
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                      if (showFeedback)
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 500),
                          padding: const EdgeInsets.all(15),
                          decoration: BoxDecoration(
                            color: isCorrect
                                ? Colors.green.withValues(alpha: 0.1)
                                : Colors.red.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isCorrect ? Colors.green : Colors.red,
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                isCorrect ? '✅' : '❌',
                                style: const TextStyle(fontSize: 32),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                  CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      isCorrect
                                          ? 'Correct! 🎉'
                                          : 'Incorrect!',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: isCorrect
                                            ? Colors.green.shade700
                                            : Colors.red.shade700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    if (!isCorrect)
                                      Text(
                                        'Correct: ${question.options[question.correctAnswerIndex]}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.red.shade700,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: ElevatedButton(
                  onPressed: !isAnswered && !showFeedback
                      ? null
                      : () {
                    if (!showFeedback) {
                      final selectedIndex =
                      selectedAnswers[currentQuestionIndex]!;
                      final question = widget
                          .quiz.questions[currentQuestionIndex];
                      setState(() {
                        showFeedback = true;
                        isCorrect =
                            selectedIndex ==
                                question.correctAnswerIndex;
                      });

                      Future.delayed(
                          const Duration(seconds: 2),
                              () {
                            if (mounted) {
                              _handleNextQuestion();
                            }
                          });
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF7C4DFF),
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    disabledBackgroundColor:
                    Colors.grey.withValues(alpha: 0.5),
                  ),
                  child: Text(
                    showFeedback ? 'Next Question' : 'Submit Answer',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnswerOption(
      int index, String optionText, bool showFeedback) {
    final question = widget.quiz.questions[currentQuestionIndex];
    final isSelected =
        selectedAnswers[currentQuestionIndex] == index;
    final isCorrectAnswer = index == question.correctAnswerIndex;

    final colors = [
      const Color(0xFFFF5252), // Red
      const Color(0xFF2196F3), // Blue
      const Color(0xFFFFC107), // Yellow
      const Color(0xFF4CAF50), // Green
    ];

    Color backgroundColor;
    if (showFeedback) {
      if (isCorrectAnswer) {
        backgroundColor = Colors.green;
      } else if (isSelected && !isCorrectAnswer) {
        backgroundColor = Colors.red;
      } else {
        backgroundColor = colors[index % colors.length].withValues(alpha: 0.7);
      }
    } else {
      backgroundColor = colors[index % colors.length];
    }

    return GestureDetector(
      onTap: !showFeedback
          ? () {
        setState(() =>
        selectedAnswers[currentQuestionIndex] = index);
      }
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              backgroundColor.withValues(alpha: isSelected ? 1 : 0.7),
              backgroundColor.withValues(alpha: isSelected ? 0.9 : 0.5),
            ],
          ),
          borderRadius: BorderRadius.circular(15),
          border: isSelected
              ? Border.all(color: Colors.white, width: 3)
              : null,
          boxShadow: isSelected
              ? [
            BoxShadow(
              color: backgroundColor.withValues(alpha: 0.5),
              blurRadius: 15,
            ),
          ]
              : [],
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              optionText,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
