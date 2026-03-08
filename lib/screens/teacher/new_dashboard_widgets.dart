import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../services/firebase_auth_service.dart';
import '../../services/firebase_quiz_service.dart';
import '../../models/quiz_models.dart';
import 'create_quiz_screen.dart';
import 'ai_quiz_generator_screen.dart';
import 'quiz_session_screen.dart';
import 'teacher_dashboard.dart';

// New Kahoot-inspired Content Widgets

// Discover Content - Shows horizontal scrolling banners
class DiscoverContent extends StatelessWidget {
  final Function(int) onTabChange;

  const DiscoverContent({super.key, required this.onTabChange});

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
                  'AI Quiz Generator',
                  'Create quizzes with AI',
                  Icons.auto_awesome,
                  const LinearGradient(
                    colors: [Color(0xFF7C4DFF), Color(0xFF2196F3)],
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AIQuizGeneratorScreen(),
                      ),
                    );
                  },
                ),
                _buildDiscoverBanner(
                  'Import Quiz',
                  'Upload from file',
                  Icons.upload_file,
                  const LinearGradient(
                    colors: [Color(0xFFFF9800), Color(0xFFFF5722)],
                  ),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Import feature coming soon!')),
                    );
                  },
                ),
                _buildDiscoverBanner(
                  'Analytics',
                  'View detailed reports',
                  Icons.analytics,
                  const LinearGradient(
                    colors: [Color(0xFF4CAF50), Color(0xFF00BCD4)],
                  ),
                  onTap: () {
                    Navigator.pushNamed(context, '/teacher/reports');
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
                  'Create Quiz',
                  Icons.add_circle,
                  const Color(0xFF7C4DFF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CreateQuizScreen(),
                      ),
                    );
                  },
                ),
                _buildQuickAction(
                  'My Quizzes',
                  Icons.quiz,
                  const Color(0xFF2196F3),
                  onTap: () => onTabChange(3),
                ),
                _buildQuickAction(
                  'Reports',
                  Icons.assessment,
                  const Color(0xFFFF9800),
                  onTap: () {
                    Navigator.pushNamed(context, '/teacher/reports');
                  },
                ),
                _buildQuickAction(
                  'Settings',
                  Icons.settings,
                  const Color(0xFF4CAF50),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Settings feature coming soon!')),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoverBanner(
    String title,
    String subtitle,
    IconData icon,
    Gradient gradient, {
    VoidCallback? onTap,
  }) {
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
    String label,
    IconData icon,
    Color color, {
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
}

// Create Test Content - Placeholder for create test
class CreateTestContent extends StatelessWidget {
  const CreateTestContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7C4DFF), Color(0xFF2196F3)],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.add_circle, size: 60, color: Colors.white),
          ),
          const SizedBox(height: 24),
          const Text(
            'Create New Test',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Tap to start creating a new quiz',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CreateQuizScreen()),
              );
            },
            icon: const Icon(Icons.add),
            label: const Text('Create Quiz'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C4DFF),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// My Tests Content - Shows all tests organized by category
class MyTestsContent extends StatelessWidget {
  const MyTestsContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'My Tests',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
          ),
          _buildTestCategory(
            context,
            '📐 Math Tests',
            const Color(0xFF2196F3),
            'M',
            filterTopics: ['Mathematics'],
          ),
          _buildTestCategory(
            context,
            '🔬 Science Tests',
            const Color(0xFF4CAF50),
            'S',
            filterTopics: ['Biology', 'Chemistry', 'Physics'],
          ),
          _buildTestCategory(
            context,
            '📚 English Tests',
            const Color(0xFFFF9800),
            'E',
            filterTopics: ['English'],
          ),
          _buildTestCategory(
            context,
            '🌍 Humanities Tests',
            const Color(0xFF7C4DFF),
            'H',
            filterTopics: ['History', 'Geography', 'Urdu'],
          ),
          _buildTestCategory(
            context,
            '✨ All Tests',
            const Color(0xFFD4AF37),
            'T',
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildTestCategory(
    BuildContext context, 
    String title, 
    Color color, 
    String categoryLetter,
    {List<String>? filterTopics}
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
              ),
              TextButton(
                onPressed: () {
                  final dashboardState = context.findAncestorStateOfType<State<TeacherDashboard>>();
                  if (dashboardState != null) {
                    (dashboardState as dynamic).setState(() {
                      (dashboardState as dynamic)._selectedIndex = 3;
                    });
                  }
                },
                child: const Text('View All'),
              ),
            ],
          ),
        ),
        StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance
              .collection('quizzes')
              .where('instructorId', isEqualTo: auth.FirebaseAuth.instance.currentUser?.uid)
              .snapshots(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            var quizzes = snapshot.data!.docs.map((doc) {
              return Quiz.fromMap(doc.data() as Map<String, dynamic>);
            }).toList();

            // Filter by topics if provided
            if (filterTopics != null) {
              quizzes = quizzes.where((q) => q.topic != null && filterTopics.contains(q.topic)).toList();
            }

            // Client-side sort by date (newest first)
            quizzes.sort((a, b) => b.createdAt.compareTo(a.createdAt));

            // Take top 5
            final displayQuizzes = quizzes.take(5).toList();
            
            if (displayQuizzes.isEmpty) {
               return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      'No tests found in this category',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                ),
              );
            }

            return Column(
              children: displayQuizzes.map((quiz) => _buildTestCard(context, quiz, color, categoryLetter)).toList(),
            );
          },
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildTestCard(BuildContext context, Quiz quiz, Color color, String categoryLetter) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => QuizSessionScreen(quiz: quiz),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
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
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  categoryLetter,
                  style: TextStyle(fontSize: 24, color: color, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    quiz.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.quiz, size: 14, color: Colors.grey.shade600),
                      const SizedBox(width: 4),
                      Text(
                        '${quiz.totalQuestions} questions',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.pin, size: 14, color: Colors.grey.shade600),
                      const SizedBox(width: 4),
                      Text(
                        quiz.pin ?? 'N/A',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.delete_outline, size: 20, color: Colors.red.shade400),
              onPressed: () => _showDeleteConfirmation(context, quiz),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Quiz quiz) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Quiz?'),
        content: Text('Are you sure you want to delete "${quiz.title}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              try {
                await FirebaseQuizService().deleteQuiz(quiz.pin!);
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Quiz deleted successfully'), backgroundColor: Colors.red),
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
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// Profile Content - Shows teacher profile
class ProfileContent extends StatelessWidget {
  const ProfileContent({super.key});

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
                colors: [Color(0xFF7C4DFF), Color(0xFF6A1B9A)],
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
              child: Text('👨‍🏫', style: TextStyle(fontSize: 50)),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Teacher Profile',
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
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C4DFF)),
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
            child: const Text('Save', style: TextStyle(color: Colors.white)),
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
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C4DFF)),
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
            child: const Text('Send Reset Link', style: TextStyle(color: Colors.white)),
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
            color: const Color(0xFF7C4DFF).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF7C4DFF), size: 20),
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
