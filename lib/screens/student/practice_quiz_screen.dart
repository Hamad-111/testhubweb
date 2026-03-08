import 'package:flutter/material.dart';

class PracticeQuizScreen extends StatefulWidget {
  const PracticeQuizScreen({super.key});

  @override
  State<PracticeQuizScreen> createState() => _PracticeQuizScreenState();
}

class _PracticeQuizScreenState extends State<PracticeQuizScreen> {
  int currentQuestion = 0;
  int score = 0;

  final List<Map<String, dynamic>> questions = [
    {
      'question': 'What is the derivative of x²?',
      'options': ['2x', 'x', '2', '4x'],
      'correct': 0,
    },
    {
      'question': 'Solve: 2x + 5 = 13',
      'options': ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
      'correct': 0,
    },
  ];

  @override
  Widget build(BuildContext context) {
    if (currentQuestion >= questions.length) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Practice Complete'),
          backgroundColor: const Color(0xFF1F2937),
        ),
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF1F2937), Color(0xFF111827)],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, size: 80, color: Colors.green),
                const SizedBox(height: 20),
                Text(
                  'Score: $score/${questions.length}',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                  ),
                  child: const Text('Back to Dashboard'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final question = questions[currentQuestion];

    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${currentQuestion + 1}/${questions.length}'),
        backgroundColor: const Color(0xFF1F2937),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1F2937), Color(0xFF111827)],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                question['question'],
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ...List.generate(
                question['options'].length,
                    (index) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton(
                    onPressed: () {
                      if (index == question['correct']) {
                        score++;
                      }
                      setState(() {
                        currentQuestion++;
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF374151),
                      minimumSize: const Size(double.infinity, 50),
                    ),
                    child: Text(
                      question['options'][index],
                      style: const TextStyle(color: Colors.white),
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
}
