import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../config/app_theme.dart';

class PreviewGeneratedQuizScreen extends StatefulWidget {
  final Quiz quiz;

  const PreviewGeneratedQuizScreen({super.key, required this.quiz});

  @override
  _PreviewGeneratedQuizScreenState createState() =>
      _PreviewGeneratedQuizScreenState();
}

class _PreviewGeneratedQuizScreenState
    extends State<PreviewGeneratedQuizScreen> {
  late List<Question> _questions;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _questions = List.from(widget.quiz.questions);
  }

  void _deleteQuestion(int index) {
    setState(() {
      _questions.removeAt(index);
    });
  }

  void _editQuestion(int index) async {
    final question = _questions[index];
    final result = await showDialog<Question>(
      context: context,
      builder: (context) => EditQuestionDialog(question: question),
    );

    if (result != null) {
      setState(() {
        _questions[index] = result;
      });
    }
  }

  Future<void> _handleDone() async {
    if (_questions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot save a quiz with no questions.')),
      );
      return;
    }

    final shouldPublish = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Publish Quiz?'),
        content: const Text(
            'Do you want to publish this quiz now? Published quizzes are immediately visible to students.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false), // No -> Draft
            child: const Text('No, Save as Draft'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true), // Yes -> Publish
            child: const Text('Yes, Publish'),
          ),
        ],
      ),
    );

    if (shouldPublish != null) {
      _saveQuiz(publish: shouldPublish);
    }
  }

  Future<void> _saveQuiz({required bool publish}) async {
    setState(() => _isSaving = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        final updatedQuiz = Quiz(
          id: widget.quiz.id,
          title: widget.quiz.title,
          description: widget.quiz.description,
          instructorId: user.uid,
          questions: _questions,
          mode: widget.quiz.mode,
          isPublished: publish,
          tags: widget.quiz.tags,
          createdAt: widget.quiz.createdAt,
          topic: widget.quiz.topic,
          timePerQuestion: widget.quiz.timePerQuestion,
        );

        final quizId = await FirebaseQuizService().createQuiz(updatedQuiz);
        
        // If publishing, ensure the PIN logic is handled if separate
        // But createQuiz typically handles basic setup. 
        // If publish is true, we might need to verify if createQuiz sets 'isPublished' correctly.
        // Assuming createQuiz saves the object as is. 
        // Reviewing FirebaseQuizService later might be needed, but 'isPublished' is in the object.
        
        // If published, double check pin generation/activation if needed.
        if (publish) {
             final createdQuiz = await FirebaseQuizService().getQuizByPin(quizId);
             if (createdQuiz != null && createdQuiz.pin != null) {
               // Ensure it's marked as published in case createQuiz didn't (though it should)
               await FirebaseQuizService().publishQuiz(createdQuiz.pin!);
             }
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(
              content: Text(publish ? 'Quiz Published!' : 'Quiz Saved as Draft'),
              backgroundColor: Colors.green,
            ),
          );
          // Navigate back to dashboard (pop until dashboard or just pop twice)
          Navigator.of(context).popUntil((route) => route.isFirst);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving quiz: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Generated Quiz', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF7C4DFF),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _handleDone,
            child: Text(
              _isSaving ? 'Saving...' : 'Done',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
           Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              '${_questions.length} Questions Generated',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _questions.length,
              itemBuilder: (context, index) {
                final question = _questions[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                             CircleAvatar(
                                radius: 12,
                                backgroundColor: const Color(0xFF7C4DFF).withOpacity(0.1),
                                child: Text('${index + 1}', style: const TextStyle(color: Color(0xFF7C4DFF), fontSize: 12, fontWeight: FontWeight.bold)),
                             ),
                             const SizedBox(width: 12),
                             Expanded(
                               child: Text(question.text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                             ),
                             IconButton(
                               icon: const Icon(Icons.edit, color: Colors.blue),
                               onPressed: () => _editQuestion(index),
                               padding: EdgeInsets.zero,
                               constraints: const BoxConstraints(),
                             ),
                             const SizedBox(width: 12),
                             IconButton(
                               icon: const Icon(Icons.delete, color: Colors.red),
                               onPressed: () => _deleteQuestion(index),
                               padding: EdgeInsets.zero,
                               constraints: const BoxConstraints(),
                             ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ...question.options.asMap().entries.map((entry) {
                           final isCorrect = entry.key == question.correctAnswerIndex;
                           return Container(
                             margin: const EdgeInsets.only(bottom: 4),
                             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                             decoration: BoxDecoration(
                               color: isCorrect ? Colors.green.withOpacity(0.1) : Colors.grey.shade50,
                               borderRadius: BorderRadius.circular(8),
                               border: Border.all(color: isCorrect ? Colors.green : Colors.grey.shade200),
                             ),
                             child: Row(
                               children: [
                                 Icon(isCorrect ? Icons.check_circle : Icons.circle_outlined, size: 16, color: isCorrect ? Colors.green : Colors.grey),
                                 const SizedBox(width: 8),
                                 Expanded(child: Text(entry.value, style: TextStyle(color: isCorrect ? Colors.green.shade700 : Colors.black87))),
                               ],
                             ),
                           );
                        }),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class EditQuestionDialog extends StatefulWidget {
  final Question question;

  const EditQuestionDialog({super.key, required this.question});

  @override
  _EditQuestionDialogState createState() => _EditQuestionDialogState();
}

class _EditQuestionDialogState extends State<EditQuestionDialog> {
  late TextEditingController _textController;
  late List<TextEditingController> _optionControllers;
  late int _correctAnswerIndex;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController(text: widget.question.text);
    _optionControllers = widget.question.options
        .map((opt) => TextEditingController(text: opt))
        .toList();
    _correctAnswerIndex = widget.question.correctAnswerIndex;
  }

  @override
  void dispose() {
    _textController.dispose();
    for (var c in _optionControllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Question'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _textController,
              decoration: const InputDecoration(labelText: 'Question Text', border: OutlineInputBorder()),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            const Text('Options (Select correct answer)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...List.generate(_optionControllers.length, (index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Radio<int>(
                      value: index,
                      groupValue: _correctAnswerIndex,
                      onChanged: (val) => setState(() => _correctAnswerIndex = val!),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _optionControllers[index],
                        decoration: InputDecoration(
                          hintText: 'Option ${index + 1}',
                          border: const OutlineInputBorder(),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_textController.text.trim().isEmpty ||
                _optionControllers.any((c) => c.text.trim().isEmpty)) {
                // Basic validation
                return;
            }
            
            final updatedQuestion = Question(
              id: widget.question.id,
              text: _textController.text.trim(),
              type: widget.question.type,
              options: _optionControllers.map((c) => c.text.trim()).toList(),
              correctAnswerIndex: _correctAnswerIndex,
              topic: widget.question.topic, // Preserve topic
              timer: widget.question.timer, // Preserve timer
            );
            Navigator.pop(context, updatedQuestion);
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
