import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../models/quiz_models.dart';
import 'quiz_session_screen.dart';

class MyQuizzesScreen extends StatefulWidget {
  const MyQuizzesScreen({super.key});

  @override
  State<MyQuizzesScreen> createState() => _MyQuizzesScreenState();
}

class _MyQuizzesScreenState extends State<MyQuizzesScreen> {
  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Quizzes'),
        backgroundColor: const Color(0xFF7C4DFF),
        elevation: 0,
        actions: [
          if (user != null) ...[
            IconButton(
              icon: const Icon(Icons.stop_circle_outlined),
              tooltip: 'Stop All Live Sessions',
              onPressed: () => _showStopAllConfirmation(context, user.uid),
            ),
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              tooltip: 'Delete All Quizzes',
              onPressed: () => _showDeleteAllConfirmation(context, user.uid),
            ),
          ]
        ],
      ),
      body: user == null 
        ? const Center(child: Text('Please log in to see your quizzes'))
        : Container(
            decoration: const BoxDecoration(
              color: Color(0xFFF5F5F5),
            ),
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('quizzes')
                  .where('instructorId', isEqualTo: user.uid)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.quiz_outlined, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text(
                          'No quizzes found',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.pushNamed(context, '/teacher/create_quiz'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C4DFF),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                          child: const Text('Create Your First Quiz', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                }

                // Parse and sort by date descending
                final quizzes = snapshot.data!.docs.map((doc) {
                  return Quiz.fromMap(doc.data() as Map<String, dynamic>);
                }).toList()
                  ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: quizzes.length,
                  itemBuilder: (context, index) {
                    final quiz = quizzes[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 2,
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12),
                        leading: Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF7C4DFF), Color(0xFF2196F3)],
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Center(
                              child: Icon(Icons.assignment, color: Colors.white, size: 24)),
                        ),
                        title: Text(
                          quiz.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text('${quiz.totalQuestions} Questions | PIN: ${quiz.pin ?? 'N/A'}'),
                            Text(
                              'Created: ${quiz.createdAt.toString().split('.')[0]}',
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                          ],
                        ),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => QuizSessionScreen(quiz: quiz),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/teacher/create_quiz');
        },
        backgroundColor: const Color(0xFF7C4DFF),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showStopAllConfirmation(BuildContext context, String uid) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          title: const Text('Stop All Live Sessions?'),
          content: const Text(
              'Are you sure you want to terminate all currently active test sessions? They will be saved as drafts instead.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                try {
                  final querySnapshot = await FirebaseFirestore.instance
                      .collection('quizzes')
                      .where('instructorId', isEqualTo: uid)
                      .where('isPublished', isEqualTo: true)
                      .get();

                  if (querySnapshot.docs.isEmpty) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('No active sessions found')),
                      );
                    }
                    return;
                  }

                  final batch = FirebaseFirestore.instance.batch();
                  for (final doc in querySnapshot.docs) {
                    batch.update(doc.reference, {'isPublished': false});
                  }
                  
                  await batch.commit();

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('All live sessions stopped successfully')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to stop sessions: $e')),
                    );
                  }
                }
              },
              style: TextButton.styleFrom(foregroundColor: Colors.orange),
              child: const Text('Stop All'),
            ),
          ],
        );
      },
    );
  }

  void _showDeleteAllConfirmation(BuildContext context, String uid) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          title: const Text('Delete ALL Quizzes?'),
          content: const Text(
              '⚠️ WARNING: Are you sure you want to delete ALL your quizzes? This action CANNOT be undone.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                try {
                  final querySnapshot = await FirebaseFirestore.instance
                      .collection('quizzes')
                      .where('instructorId', isEqualTo: uid)
                      .get();

                  if (querySnapshot.docs.isEmpty) return;

                  final batch = FirebaseFirestore.instance.batch();
                  for (final doc in querySnapshot.docs) {
                    batch.delete(doc.reference);
                  }
                  
                  await batch.commit();

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('All quizzes deleted successfully')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to delete quizzes: $e')),
                    );
                  }
                }
              },
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('Delete All'),
            ),
          ],
        );
      },
    );
  }
}
