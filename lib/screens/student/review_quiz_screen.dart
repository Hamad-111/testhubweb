import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';

class ReviewQuizScreen extends StatefulWidget {
  final QuizResult result;

  const ReviewQuizScreen({super.key, required this.result});

  @override
  State<ReviewQuizScreen> createState() => _ReviewQuizScreenState();
}

class _ReviewQuizScreenState extends State<ReviewQuizScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();
  Quiz? _quiz;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    try {
      final quiz = await _quizService.getQuizById(widget.result.quizId);
      setState(() {
        _quiz = quiz;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading quiz: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Quiz'),
        backgroundColor: const Color(0xFF2196F3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _quiz == null
              ? const Center(child: Text('Quiz details not found'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _quiz!.questions.length,
                  itemBuilder: (context, index) {
                    final question = _quiz!.questions[index];
                    
                    // Determine selected answer index
                    int selectedIndex = -1;
                    if (widget.result.questionResults != null && widget.result.questionResults!.isNotEmpty) {
                        // Try to find matching question result
                        final qr = widget.result.questionResults!.firstWhere(
                            (q) => q.questionId == question.id,
                            orElse: () => QuestionResult(
                                questionId: '', 
                                selectedAnswerIndex: -1, 
                                correctAnswerIndex: 0, 
                                isCorrect: false, 
                                timeSpent: 0
                            )
                        );
                        if (qr.questionId.isNotEmpty) {
                            selectedIndex = qr.selectedAnswerIndex;
                        } else if (index < widget.result.answersGiven.length) {
                             // Fallback to index if IDs don't match
                            selectedIndex = widget.result.answersGiven[index];
                        }
                    } else if (index < widget.result.answersGiven.length) {
                      selectedIndex = widget.result.answersGiven[index];
                    }

                    final bool isCorrect = selectedIndex == question.correctAnswerIndex;
                    final bool isSkipped = selectedIndex == -1;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isCorrect 
                                        ? Colors.green.withOpacity(0.1) 
                                        : (isSkipped ? Colors.grey.withOpacity(0.1) : Colors.red.withOpacity(0.1)),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(
                                        color: isCorrect 
                                            ? Colors.green 
                                            : (isSkipped ? Colors.grey : Colors.red)
                                    ),
                                  ),
                                  child: Text(
                                    'Q${index + 1}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: isCorrect 
                                          ? Colors.green 
                                          : (isSkipped ? Colors.grey : Colors.red),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    question.text,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            ...List.generate(question.options.length, (optIndex) {
                                final isSelected = optIndex == selectedIndex;
                                final isTrueCorrect = optIndex == question.correctAnswerIndex;
                                
                                Color bgColor = Colors.transparent;
                                Color borderColor = Colors.grey.shade300;
                                IconData? icon;
                                Color iconColor = Colors.transparent;

                                if (isTrueCorrect) {
                                    bgColor = Colors.green.withOpacity(0.1);
                                    borderColor = Colors.green;
                                    icon = Icons.check_circle;
                                    iconColor = Colors.green;
                                } else if (isSelected && !isTrueCorrect) {
                                    bgColor = Colors.red.withOpacity(0.1);
                                    borderColor = Colors.red;
                                    icon = Icons.cancel;
                                    iconColor = Colors.red;
                                }

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: bgColor,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: borderColor),
                                  ),
                                  child: Row(
                                    children: [
                                        Text(
                                            String.fromCharCode(65 + optIndex) + '.', 
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: Colors.grey.shade700
                                            )
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(child: Text(question.options[optIndex])),
                                        if (icon != null) Icon(icon, color: iconColor, size: 20),
                                    ],
                                  ),
                                );
                            }),
                            if (isSkipped)
                                Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(
                                        'Skipped',
                                        style: TextStyle(color: Colors.orange, fontStyle: FontStyle.italic),
                                    ),
                                ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
