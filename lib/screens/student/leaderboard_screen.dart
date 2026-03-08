import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../config/app_theme.dart';
import '../../models/user_model.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Leaderboard'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: const LeaderboardContent(),
    );
  }
}

class LeaderboardContent extends StatefulWidget {
  const LeaderboardContent({super.key});

  @override
  State<LeaderboardContent> createState() => _LeaderboardContentState();
}

class _LeaderboardContentState extends State<LeaderboardContent> {
  final String _currentUserId = FirebaseAuth.instance.currentUser?.uid ?? '';

  @override
  Widget build(BuildContext context) {
    const Color primaryGold = Color(0xFFD4AF37);
    final user = FirebaseAuth.instance.currentUser;

    return StreamBuilder<QuerySnapshot>(
      // DIAGNOSTIC CHANGE: Simplified query to verify basic read permission
      // original: .where('role', isEqualTo: 'student').orderBy('totalScore', descending: true).limit(50)
      stream: FirebaseFirestore.instance
          .collection('users')
          .limit(50)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          final error = snapshot.error.toString();
          debugPrint('[Leaderboard Debug] Query Error: $error');
          debugPrint('[Leaderboard Debug] Auth UID: ${user?.uid}');

          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 48),
                  const SizedBox(height: 16),
                  const Text(
                    'Information Access Error',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'There was a problem loading the leaderboard. This might be due to security rules or a missing index.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: SelectableText(
                      'Details: $error\nUID: ${user?.uid ?? "Not Logged In"}',
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => setState(() {}),
                    style: ElevatedButton.styleFrom(backgroundColor: primaryGold),
                    child: const Text('Try Again', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          );
        }

        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final docs = snapshot.data?.docs ?? [];
        if (docs.isEmpty) {
          return const Center(child: Text('No players yet!'));
        }

        // Find current user rank
        int myRank = 0;
        int myScore = 0;
        for (int i = 0; i < docs.length; i++) {
          if (docs[i].id == _currentUserId) {
            myRank = i + 1;
            myScore = (docs[i].data() as Map<String, dynamic>)['totalScore'] ?? 0;
            break;
          }
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (myRank > 0) ...[
                Text(
                  'Your Rank',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.leaderboardTitleColor,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                    ),
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Current Position',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '#$myRank',
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Score: $myScore pts',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                      const Text('🏆', style: TextStyle(fontSize: 64)),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
              ],
              Text(
                'Top Scorers',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.topScorersTextColor,
                ),
              ),
              const SizedBox(height: 15),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: docs.length,
                itemBuilder: (context, index) {
                  final data = docs[index].data() as Map<String, dynamic>;
                  final name = data['name'] ?? 'Unknown';
                  final score = data['totalScore'] ?? 0;
                  final isMe = docs[index].id == _currentUserId;
                  final medals = ['🥇', '🥈', '🥉'];

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: isMe
                          ? AppTheme.primaryColor.withValues(alpha: 0.05)
                          : (index < 3
                              ? const Color(0xFFFFC107).withValues(alpha: 0.1)
                              : Colors.white),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isMe
                            ? AppTheme.primaryColor.withValues(alpha: 0.3)
                            : (index < 3
                                ? const Color(0xFFFFC107).withValues(alpha: 0.3)
                                : const Color(0xFFE5E7EB)),
                        width: isMe ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 45,
                          height: 45,
                          decoration: BoxDecoration(
                            color: index < 3
                                ? const Color(0xFFFFC107).withValues(alpha: 0.2)
                                : Colors.grey.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              index < 3 ? medals[index] : '${index + 1}',
                              style: const TextStyle(fontSize: 20),
                            ),
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isMe ? '$name (You)' : name,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: isMe
                                      ? AppTheme.primaryColor
                                      : const Color(0xFF1F2937),
                                ),
                              ),
                              if (data['quizzesTaken'] != null)
                                Text(
                                  '${data['quizzesTaken']} quizzes',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Text(
                          '$score',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: index < 3
                                ? const Color(0xFFE65100) // Darker orange/gold
                                : AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
