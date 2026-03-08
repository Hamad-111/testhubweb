import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../services/firebase_quiz_service.dart';
import '../../services/weak_topic_service.dart';

class WeakTopicsScreen extends StatefulWidget {
  const WeakTopicsScreen({super.key});

  @override
  State<WeakTopicsScreen> createState() => _WeakTopicsScreenState();
}

class _WeakTopicsScreenState extends State<WeakTopicsScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();
  final WeakTopicService _weakTopicService = WeakTopicService();
  bool _isLoading = true;
  List<Map<String, dynamic>> weakTopics = [];

  @override
  void initState() {
    super.initState();
    _loadWeakTopics();
  }

  Future<void> _loadWeakTopics() async {
    try {
      final currentUser = auth.FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        final results = await _quizService.getStudentResults(currentUser.uid);

        // Analyze weak topics from results
        final topicsMap = <String, Map<String, dynamic>>{};

        for (var result in results) {
          for (var weakTopic in result.weakTopics ?? []) {
            if (topicsMap.containsKey(weakTopic)) {
              topicsMap[weakTopic]!['attempts'] += 1;
              topicsMap[weakTopic]!['totalScore'] += result.percentageScore ?? (result.score / result.totalQuestions * 100);
            } else {
              topicsMap[weakTopic] = {
                'topic': weakTopic,
                'attempts': 1,
                'totalScore': result.percentageScore ?? (result.score / result.totalQuestions * 100),
              };
            }
          }
        }

        // Calculate average accuracy
        final weakTopicsList = topicsMap.values.map((data) {
          final avgAccuracy = (data['totalScore'] / data['attempts']).round();
          return {
            'topic': data['topic'],
            'accuracy': avgAccuracy,
            'attempts': data['attempts'],
            'difficulty': avgAccuracy < 50 ? 'High' : (avgAccuracy < 70 ? 'Medium' : 'Low'),
          };
        }).toList();

        // Sort by accuracy (lowest first)
        weakTopicsList.sort((a, b) => (a['accuracy'] as int).compareTo(b['accuracy'] as int));

        setState(() {
          weakTopics = weakTopicsList;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading weak topics: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weak Topics'),
        backgroundColor: const Color(0xFF1F2937),
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1F2937), Color(0xFF111827)],
          ),
        ),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : weakTopics.isEmpty
            ? Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.celebration, size: 80, color: Color(0xFF10B981)),
                const SizedBox(height: 20),
                const Text(
                  'No Weak Topics!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Great job! You\'re performing well\nin all topics.',
                  style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        )
            : ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: weakTopics.length,
          itemBuilder: (context, index) {
            final topic = weakTopics[index];
            final accuracy = topic['accuracy'] as int;
            final color = accuracy > 75 ? Colors.green : (accuracy > 60 ? Colors.orange : Colors.red);

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              color: const Color(0xFF374151),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            topic['topic'],
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Chip(
                          label: Text('${topic['accuracy']}%'),
                          backgroundColor: color.withValues(alpha: 0.3),
                          labelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(
                      value: accuracy / 100,
                      minHeight: 6,
                      backgroundColor: Colors.grey[700],
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Attempts: ${topic['attempts']}',
                              style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'Difficulty: ${topic['difficulty']}',
                                style: TextStyle(
                                  color: color,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Practice mode for ${topic['topic']} coming soon!'),
                                backgroundColor: const Color(0xFF3B82F6),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          icon: const Icon(Icons.school, size: 16),
                          label: const Text('Practice'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3B82F6),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
