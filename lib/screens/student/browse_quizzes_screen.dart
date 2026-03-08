import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';
import 'join_game_screen.dart'; // Ensure this matches your project structure

class BrowseQuizzesScreen extends StatefulWidget {
  const BrowseQuizzesScreen({super.key});

  @override
  State<BrowseQuizzesScreen> createState() => _BrowseQuizzesScreenState();
}

class _BrowseQuizzesScreenState extends State<BrowseQuizzesScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();
  String _selectedTopic = 'All';

  final List<String> _topics = [
    'All',
    'General Knowledge',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'History',
    'Geography',
    'English',
    'Urdu'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Quizzes'),
        backgroundColor: const Color(0xFF2196F3),
      ),
      body: Column(
        children: [
          // Topic Selector
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _topics.length,
              itemBuilder: (context, index) {
                final topic = _topics[index];
                final isSelected = _selectedTopic == topic;
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: FilterChip(
                    label: Text(topic),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() => _selectedTopic = topic);
                    },
                    selectedColor: const Color(0xFF2196F3).withOpacity(0.2),
                    checkmarkColor: const Color(0xFF2196F3),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF2196F3) : Colors.black87,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    backgroundColor: Colors.grey.shade100,
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          // Quiz List
          Expanded(
            child: StreamBuilder<List<Quiz>>(
              stream: _quizService.getQuizzesByTopicStream(_selectedTopic),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }

                final quizzes = snapshot.data ?? [];

                if (quizzes.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text(
                          'No quizzes found for $_selectedTopic',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: quizzes.length,
                  itemBuilder: (context, index) {
                    final quiz = quizzes[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: const Color(0xFF2196F3).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Center(
                            child: Text('📝', style: TextStyle(fontSize: 24)),
                          ),
                        ),
                        title: Text(
                          quiz.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(
                              quiz.description.isNotEmpty ? quiz.description : 'No description',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.topic, size: 14, color: Colors.grey.shade600),
                                const SizedBox(width: 4),
                                Text(
                                  quiz.topic ?? 'General',
                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                ),
                                const SizedBox(width: 12),
                                Icon(Icons.help_outline, size: 14, color: Colors.grey.shade600),
                                const SizedBox(width: 4),
                                Text(
                                  '${quiz.totalQuestions} Qs',
                                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ],
                        ),
                        onTap: () {
                          // Navigate to JoinGameScreen with PIN pre-filled
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => JoinGameScreen(initialPin: quiz.pin),
                            ),
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
