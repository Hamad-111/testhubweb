import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../services/firebase_auth_service.dart';
import 'join_game_screen.dart';
import 'student_ai_quiz_generator_screen.dart';
import 'student_ai_notes_generator_screen.dart';
import 'leaderboard_screen.dart';

// Student Discover Content - Shows horizontal scrolling banners
class StudentDiscoverContent extends StatelessWidget {
  final Function(int)? onTabChange;

  const StudentDiscoverContent({super.key, this.onTabChange});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'Discover',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Featured Banners
          SizedBox(
            height: 180,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildDiscoverBanner(
                  context,
                  'Join Quiz',
                  'Enter PIN to join',
                  Icons.login,
                  const LinearGradient(
                    colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                  ),
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const JoinGameScreen()),
                    );
                  },
                ),
                _buildDiscoverBanner(
                  context,
                  'My Results',
                  'View your scores',
                  Icons.assessment,
                  const LinearGradient(
                    colors: [Color(0xFF00BCD4), Color(0xFF0097A7)],
                  ),
                  () {
                    Navigator.pushNamed(context, '/student/reports');
                  },
                ),
                _buildDiscoverBanner(
                  context,
                  'Practice',
                  'Practice quizzes',
                  Icons.school,
                  const LinearGradient(
                    colors: [Color(0xFF4CAF50), Color(0xFF00BCD4)],
                  ),
                  () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Practice mode coming soon!')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Quick Actions',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
          const SizedBox(height: 15),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 15,
              crossAxisSpacing: 15,
              children: [
                _buildQuickAction(
                  context,
                  'Join Quiz',
                  Icons.login,
                  const Color(0xFF2196F3),
                  () => onTabChange?.call(2),
                ),
                _buildQuickAction(
                  context,
                  'My Results',
                  Icons.bar_chart,
                  const Color(0xFF00BCD4),
                  () => onTabChange?.call(3),
                ),
                _buildQuickAction(
                  context,
                  'Leaderboard',
                  Icons.emoji_events,
                  const Color(0xFFFFC107),
                  () {
                     Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LeaderboardScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  context,
                  'Profile',
                  Icons.person,
                  const Color(0xFF4CAF50),
                  () => onTabChange?.call(4),
                ),
                _buildQuickAction(
                  context,
                  'AI Quiz',
                  Icons.auto_awesome,
                  const Color(0xFF7C4DFF),
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const StudentAIQuizGeneratorScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  context,
                  'AI Notes',
                  Icons.draw,
                  const Color(0xFF00BCD4),
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const StudentAINotesGeneratorScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Live Quizzes',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
          const SizedBox(height: 15),
          StreamBuilder<QuerySnapshot>(
            stream: FirebaseFirestore.instance
                .collection('quizzes')
                .where('mode', isEqualTo: 'live')
                .where('isPublished', isEqualTo: true)
                .limit(5)
                .snapshots(),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.event_busy, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 10),
                        Text(
                          'No live quizzes at the moment',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: snapshot.data!.docs.length,
                itemBuilder: (context, index) {
                  final quiz = snapshot.data!.docs[index].data() as Map<String, dynamic>;
                  final theme = _getSubjectTheme(
                    quiz['title'] ?? '',
                    quiz['tags'] as List<dynamic>?,
                  );
                  final color = theme['color'] as Color;
                  final iconText = theme['icon'] as String;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            iconText,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: color,
                            ),
                          ),
                        ),
                      ),
                      title: Text(
                        quiz['title'] ?? 'Live Quiz',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(quiz['description'] ?? 'Join now!'),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF44336),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'LIVE',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                theme['label'] as String,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: color,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      trailing: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const JoinGameScreen()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: color,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Join'),
                      ),
                    ),
                  );
                },
              );
            },
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildDiscoverBanner(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Gradient gradient,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 300,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 48, color: Colors.white),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickAction(
      BuildContext context, String label, IconData icon, Color color, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      ),
    );
  }


  Map<String, dynamic> _getSubjectTheme(String title, List<dynamic>? tags) {
    final lowerTitle = title.toLowerCase();
    final lowerTags = tags?.map((e) => e.toString().toLowerCase()).toList() ?? [];

    if (lowerTitle.contains('math') || lowerTags.contains('math')) {
      return {'color': const Color(0xFF2196F3), 'icon': 'M', 'label': 'Math'};
    } else if (lowerTitle.contains('science') || lowerTitle.contains('physics') || lowerTitle.contains('chemistry') || lowerTitle.contains('biology') || lowerTags.contains('science')) {
      return {'color': const Color(0xFF4CAF50), 'icon': 'S', 'label': 'Science'};
    } else if (lowerTitle.contains('english') || lowerTags.contains('english')) {
      return {'color': const Color(0xFFFF9800), 'icon': 'E', 'label': 'English'};
    } else if (lowerTitle.contains('computer') || lowerTitle.contains('programming') || lowerTitle.contains('code') || lowerTags.contains('computer')) {
      return {'color': const Color(0xFF7C4DFF), 'icon': 'C', 'label': 'Computer'};
    } else {
      return {'color': const Color(0xFFD4AF37), 'icon': 'T', 'label': 'Test'};
    }
  }
}

// Join Quiz Content - PIN input screen
class JoinQuizContent extends StatefulWidget {
  const JoinQuizContent({super.key});

  @override
  State<JoinQuizContent> createState() => _JoinQuizContentState();
}

class _JoinQuizContentState extends State<JoinQuizContent> {
  final TextEditingController _pinController = TextEditingController();

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.login, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 32),
            const Text(
              'Join a Quiz',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Enter the PIN code provided by your teacher',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: TextField(
                controller: _pinController,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                  color: Color(0xFF2196F3),
                ),
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: const InputDecoration(
                  hintText: '000000',
                  border: InputBorder.none,
                  counterText: '',
                ),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                if (_pinController.text.isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const JoinGameScreen()),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Text(
                'Join Quiz',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// My Results Content - Shows quiz results
class MyResultsContent extends StatelessWidget {
  const MyResultsContent({super.key});

  @override
  Widget build(BuildContext context) {
    final authUser = auth.FirebaseAuth.instance.currentUser;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'My Results',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
          StreamBuilder<QuerySnapshot>(
            stream: authUser != null
                ? FirebaseFirestore.instance
                    .collection('quiz_results')
                    .where('studentId', isEqualTo: authUser.uid)
                    .orderBy('completedAt', descending: true)
                    .limit(10)
                    .snapshots()
                : const Stream.empty(),
            builder: (context, snapshot) {
              if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      children: [
                        Icon(Icons.assessment, size: 80, color: Colors.grey.shade300),
                        const SizedBox(height: 16),
                        Text(
                          'No quiz results yet',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: snapshot.data!.docs.length,
                itemBuilder: (context, index) {
                  final result = snapshot.data!.docs[index].data() as Map<String, dynamic>;
                  final score = result['percentageScore'] ?? 0.0;
                  final color = score >= 80
                      ? const Color(0xFF4CAF50)
                      : score >= 60
                          ? const Color(0xFFFF9800)
                          : const Color(0xFFF44336);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '${score.toStringAsFixed(0)}%',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                result['quizTitle'] ?? 'Quiz',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1F2937),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${result['correctAnswers']}/${result['totalQuestions']} correct',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
                      ],
                    ),
                  );
                },
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// Student Profile Content - Shows student profile
class StudentProfileContent extends StatelessWidget {
  const StudentProfileContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
              ),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 4),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text('👨‍🎓', style: TextStyle(fontSize: 50)),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Student Profile',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Manage your account settings',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          _buildProfileOption(Icons.person, 'Edit Profile', () => _showEditProfileDialog(context)),
          _buildProfileOption(Icons.lock, 'Change Password', () => _showChangePasswordDialog(context)),
          _buildProfileOption(Icons.notifications, 'Notifications', () => _showInfoDialog(context, 'Notifications', 'Notification settings will be available soon!')),
          _buildProfileOption(Icons.help, 'Help & Support', () => _showInfoDialog(context, 'Help & Support', 'Contact us at support@testhub.com for any assistance.')),
          _buildProfileOption(Icons.info, 'About', () => _showInfoDialog(context, 'About Test Hub', 'Version 1.0.0\n\nA modern learning platform for students and teachers.')),
        ],
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    final user = FirebaseAuthService().currentUser;
    final controller = TextEditingController(text: user?.displayName ?? '');
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Display Name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                await user?.updateDisplayName(controller.text);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile updated!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final user = FirebaseAuthService().currentUser;
    if (user?.email == null) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: const Text('Would you like to receive a password reset link at your registered email?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                await FirebaseAuthService().sendPasswordResetEmail(user!.email!);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Reset email sent!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Send Reset Link'),
          ),
        ],
      ),
    );
  }

  void _showInfoDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }

  Widget _buildProfileOption(IconData icon, String label, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: const Color(0xFF2196F3).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF2196F3), size: 20),
        ),
        title: Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF1F2937),
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
