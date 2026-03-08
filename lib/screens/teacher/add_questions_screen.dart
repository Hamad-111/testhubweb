import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../widgets/animated_card.dart';

class AddQuestionsScreen extends StatefulWidget {
  final String title;
  final String description;
  final String subject;
  final int timePerQuestion;
  final int questionLimit;

  const AddQuestionsScreen({
    super.key,
    required this.title,
    required this.description,
    required this.subject,
    required this.timePerQuestion,
    this.questionLimit = 10, // Made optional with default value of 10
  });

  @override
  State<AddQuestionsScreen> createState() => _AddQuestionsScreenState();
}

class _AddQuestionsScreenState extends State<AddQuestionsScreen>
    with SingleTickerProviderStateMixin {
  final List<Question> questions = [];
  late TextEditingController _questionController;
  late TextEditingController _answer1Controller;
  late TextEditingController _answer2Controller;
  late TextEditingController _answer3Controller;
  late TextEditingController _answer4Controller;
  String _correctAnswer = 'a';
  bool _isPublishing = false;
  late AnimationController _listController;

  @override
  void initState() {
    super.initState();
    _questionController = TextEditingController();
    _answer1Controller = TextEditingController();
    _answer2Controller = TextEditingController();
    _answer3Controller = TextEditingController();
    _answer4Controller = TextEditingController();
    _listController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  void _addQuestion() {
    if (questions.length >= widget.questionLimit) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Question limit reached (${widget.questionLimit}/${widget.questionLimit})'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (_questionController.text.isEmpty ||
        _answer1Controller.text.isEmpty ||
        _answer2Controller.text.isEmpty ||
        _answer3Controller.text.isEmpty ||
        _answer4Controller.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill all fields'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final question = Question(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: _questionController.text,
      type: QuestionType.multipleChoice,
      options: [
        _answer1Controller.text,
        _answer2Controller.text,
        _answer3Controller.text,
        _answer4Controller.text,
      ],
      correctAnswerIndex: _correctAnswer == 'a' ? 0 :
      _correctAnswer == 'b' ? 1 :
      _correctAnswer == 'c' ? 2 : 3,
      topic: widget.subject,
      timer: Duration(seconds: widget.timePerQuestion),
    );

    setState(() {
      questions.add(question);
      _questionController.clear();
      _answer1Controller.clear();
      _answer2Controller.clear();
      _answer3Controller.clear();
      _answer4Controller.clear();
      _correctAnswer = 'a';
    });

    _listController.forward().then((_) {
      _listController.reverse();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Question ${questions.length} added successfully ✓'),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _removeQuestion(int index) {
    setState(() => questions.removeAt(index));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Question removed'),
        backgroundColor: Colors.orange,
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _editQuestion(int index) {
    final question = questions[index];

    setState(() {
      _questionController.text = question.text;
      _answer1Controller.text = question.options[0];
      _answer2Controller.text = question.options[1];
      _answer3Controller.text = question.options[2];
      _answer4Controller.text = question.options[3];
      _correctAnswer = ['a', 'b', 'c', 'd'][question.correctAnswerIndex];
    });

    // Remove the old question
    questions.removeAt(index);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Editing Question ${index + 1} - Make changes and click Add Question'),
        backgroundColor: const Color(0xFF2196F3),
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _publishQuiz() async {
    if (questions.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please add at least 3 questions (${questions.length}/3)',
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isPublishing = true);

    try {
      await Future.delayed(const Duration(seconds: 1));

      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('No user logged in');
      }

      final pin = (100000 + DateTime.now().millisecondsSinceEpoch % 900000).toString();

      final quiz = Quiz(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: widget.title,
        description: widget.description,
        instructorId: currentUser.uid,
        questions: questions,
        mode: QuizMode.live,
        isPublished: true,
        createdAt: DateTime.now(),
        publishedAt: DateTime.now(),
        tags: [widget.subject],
        pin: pin,
        timePerQuestion: widget.timePerQuestion,
        topic: widget.subject,
      );

      final quizService = FirebaseQuizService();
      await quizService.createQuiz(quiz);

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Text('Quiz Published! 🎉'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Share this PIN with students:',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF6B7280),
                  ),
                ),
                const SizedBox(height: 15),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7C4DFF).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF7C4DFF),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    pin,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF7C4DFF),
                      letterSpacing: 5,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Questions: ${questions.length}\nTime: ${widget.timePerQuestion}s per question',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('Done'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error publishing quiz: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPublishing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (questions.isNotEmpty) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Discard Quiz?'),
              content: const Text(
                'Are you sure you want to go back? Your questions will be lost.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  child: const Text('Discard'),
                ),
              ],
            ),
          );
          return false;
        }
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF7C4DFF),
          title: const Text('Add Questions'),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              if (questions.isNotEmpty) {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Discard Quiz?'),
                    content: const Text(
                      'Are you sure you want to go back? Your questions will be lost.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                          Navigator.pop(context);
                        },
                        child: const Text('Discard'),
                      ),
                    ],
                  ),
                );
              } else {
                Navigator.pop(context);
              }
            },
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedCardWidget(
                delay: const Duration(milliseconds: 100),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Add Question',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 15),
                      TextField(
                        controller: _questionController,
                        maxLines: 2,
                        decoration: InputDecoration(
                          labelText: 'Question Text',
                          hintText: 'Enter your question here',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                                color: Color(0xFFE5E7EB)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                                color: Color(0xFFE5E7EB)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(
                              color: const Color(0xFF7C4DFF),
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 15),
                      const Text(
                        'Answer Options',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildAnswerField(
                        'A',
                        _answer1Controller,
                        const Color(0xFFFF5252),
                        'a',
                      ),
                      const SizedBox(height: 10),
                      _buildAnswerField(
                        'B',
                        _answer2Controller,
                        const Color(0xFF2196F3),
                        'b',
                      ),
                      const SizedBox(height: 10),
                      _buildAnswerField(
                        'C',
                        _answer3Controller,
                        const Color(0xFFFFC107),
                        'c',
                      ),
                      const SizedBox(height: 10),
                      _buildAnswerField(
                        'D',
                        _answer4Controller,
                        const Color(0xFF4CAF50),
                        'd',
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _addQuestion,
                          icon: const Icon(Icons.add),
                          label: const Text('Add Question'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C4DFF),
                            foregroundColor: Colors.white,
                            minimumSize: const Size(double.infinity, 45),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 5,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 30),
              AnimatedCardWidget(
                delay: const Duration(milliseconds: 150),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Questions Added',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: questions.length >= widget.questionLimit
                            ? const Color(0xFF4CAF50).withValues(alpha: 0.1)
                            : const Color(0xFF7C4DFF).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: questions.length >= widget.questionLimit
                              ? const Color(0xFF4CAF50)
                              : const Color(0xFF7C4DFF),
                        ),
                      ),
                      child: Text(
                        '${questions.length}/${widget.questionLimit}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: questions.length >= widget.questionLimit
                              ? const Color(0xFF4CAF50)
                              : const Color(0xFF7C4DFF),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              if (questions.isEmpty)
                AnimatedCardWidget(
                  delay: const Duration(milliseconds: 200),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(40),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          '📋',
                          style: TextStyle(fontSize: 48),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'No questions added yet\nAdd at least 3 questions',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: questions.length,
                  itemBuilder: (context, index) {
                    final question = questions[index];
                    return AnimatedCardWidget(
                      delay: Duration(
                          milliseconds: 200 + (index * 50)),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 15),
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFFE5E7EB)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    'Q${index + 1}: ${question.text}',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1F2937),
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit, color: Color(0xFF2196F3)),
                                  tooltip: 'Edit Question',
                                  onPressed: () => _editQuestion(index),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  tooltip: 'Delete Question',
                                  onPressed: () => _removeQuestion(index),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            ...question.options
                                .asMap()
                                .entries
                                .map((entry) {
                              final idx = entry.key;
                              final answerText = entry.value;
                              final answerLabels = [
                                'A',
                                'B',
                                'C',
                                'D'
                              ];
                              final isCorrect = idx == question.correctAnswerIndex;
                              final colors = [
                                const Color(0xFFFF5252),
                                const Color(0xFF2196F3),
                                const Color(0xFFFFC107),
                                const Color(0xFF4CAF50),
                              ];
                              return Padding(
                                padding:
                                const EdgeInsets.symmetric(
                                    vertical: 4),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 30,
                                      height: 30,
                                      decoration: BoxDecoration(
                                        color: colors[idx].withValues(alpha: 0.7),
                                        borderRadius:
                                        BorderRadius.circular(
                                            6),
                                        border: Border.all(
                                          color: isCorrect ? Colors.green : Colors.grey,
                                          width: isCorrect ? 3 : 1,
                                        ),
                                      ),
                                      child: Center(
                                        child: Text(
                                          answerLabels[idx],
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight:
                                            FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        answerText,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight:
                                          isCorrect
                                              ? FontWeight
                                              .bold
                                              : FontWeight
                                              .normal,
                                        ),
                                      ),
                                    ),
                                    if (isCorrect)
                                      const Text(
                                        ' ✓',
                                        style: TextStyle(
                                          color: Colors.green,
                                          fontWeight:
                                          FontWeight.bold,
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            })
                                ,
                          ],
                        ),
                      ),
                    );
                  },
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
        floatingActionButton: questions.length >= 3
            ? FloatingActionButton.extended(
          onPressed: _isPublishing
              ? null
              : () {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: const [
                    Icon(Icons.rocket_launch, color: Color(0xFF4CAF50)),
                    SizedBox(width: 10),
                    Text('Publish Quiz?'),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ready to go live with your quiz!',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.quiz, size: 16),
                              const SizedBox(width: 8),
                              Text('${questions.length} Questions'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.timer, size: 16),
                              const SizedBox(width: 8),
                              Text('${widget.timePerQuestion}s per question'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: const [
                              Icon(Icons.live_tv, size: 16, color: Color(0xFFFF5252)),
                              SizedBox(width: 8),
                              Text('Live Game Mode', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 15),
                    const Text(
                      'A 6-digit PIN will be generated for students to join.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Keep Editing'),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _publishQuiz();
                    },
                    icon: const Icon(Icons.publish),
                    label: const Text('Publish Now'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4CAF50),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          backgroundColor: const Color(0xFF4CAF50),
          foregroundColor: Colors.white,
          icon: _isPublishing
              ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              strokeWidth: 2,
            ),
          )
              : const Icon(Icons.check_circle),
          label: Text(
            _isPublishing ? 'Publishing...' : 'DONE',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          elevation: 8,
        )
            : null,
        floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      ),
    );
  }

  Widget _buildAnswerField(
      String label,
      TextEditingController controller,
      Color color,
      String answerId,
      ) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => setState(() => _correctAnswer = answerId),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _correctAnswer == answerId
                  ? color
                  : color.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: _correctAnswer == answerId
                    ? color
                    : color.withValues(alpha: 0.5),
                width: 2,
              ),
            ),
            child: Center(
              child: Text(
                label,
                style: TextStyle(
                  color: _correctAnswer == answerId
                      ? Colors.white
                      : Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: 'Answer $label',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: color,
                  width: 2,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _questionController.dispose();
    _answer1Controller.dispose();
    _answer2Controller.dispose();
    _answer3Controller.dispose();
    _answer4Controller.dispose();
    _listController.dispose();
    super.dispose();
  }
}
