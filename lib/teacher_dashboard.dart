import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:testhub2/screens/teacher/create_quiz_screen.dart';
import '../../models/quiz_models.dart';
import '../../models/user_model.dart';
import '../../services/firebase_quiz_service.dart';
import 'screens/teacher/AI_document_analysis_screen.dart';
import 'screens/teacher/manage_students_screen.dart';
import 'screens/teacher/quiz_session_screen.dart';
import '../../config/app_theme.dart'; // Assuming AppTheme is in this path

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: AppTheme.goldGradient,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          'Test Hub - Teacher',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.all(15),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text('👨‍🏫', style: TextStyle(fontSize: 20)),
              ),
            ),
          ),
        ],
      ),
      drawer: Drawer(
        child: Container(
          decoration: BoxDecoration(
            gradient: AppTheme.goldGradient,
          ),
          child: SafeArea(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.3),
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text('👨‍🏫', style: TextStyle(fontSize: 32)),
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Mr. Ahmed',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Teacher',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                _drawerItem(Icons.dashboard, 'Dashboard', 0),
                _drawerItem(Icons.quiz, 'Quizzes', 1),
                _drawerItem(Icons.analytics, 'Analytics', 2),
                _drawerItem(Icons.settings, 'Settings', 3),
                _drawerItem(Icons.description, 'Upload Document', 4),
                _drawerItem(Icons.people, 'Manage Students', 5),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: SizedBox(
                    width: double.infinity,
                    height: 45,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          '/',
                              (route) => false,
                        );
                      },
                      icon: const Icon(Icons.logout, size: 18),
                      label: const Text('Logout'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade400,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          TeacherDashboardContent(
            onRefresh: () => setState(() {}),
          ),
          QuizManagementContent(
            onRefresh: () => setState(() {}),
          ),
          const AnalyticsContent(),
          const SettingsContent(),
          const AIDocumentAnalysisScreen(),
          const ManageStudentsScreen(),
        ],
      ),
    );
  }

  Widget _drawerItem(IconData icon, String label, int index) {
    bool isSelected = _selectedIndex == index;
    return ListTile(
      leading: Icon(icon, color: Colors.white, size: 22),
      title: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
      ),
      selected: isSelected,
      selectedTileColor: Colors.white.withValues(alpha: 0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      onTap: () {
        setState(() => _selectedIndex = index);
        Navigator.pop(context);
      },
    );
  }
}

class TeacherDashboardContent extends StatefulWidget {
  final VoidCallback onRefresh;

  const TeacherDashboardContent({super.key, required this.onRefresh});

  @override
  State<TeacherDashboardContent> createState() =>
      _TeacherDashboardContentState();
}

class _TeacherDashboardContentState extends State<TeacherDashboardContent>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  final FirebaseQuizService _quizService = FirebaseQuizService();
  AppUser? _currentUser;
  int _totalQuizzes = 0;
  int _activeSessions = 0;
  int _totalStudents = 0;
  double _avgScore = 0;
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animationController.forward();
    _loadTeacherData();
  }

  Future<void> _loadTeacherData() async {
    try {
      final authUser = auth.FirebaseAuth.instance.currentUser;
      if (authUser != null) {
        // Load teacher profile
        final userDoc = await FirebaseFirestore.instance
            .collection('users')
            .doc(authUser.uid)
            .get();

        if (userDoc.exists) {
          _currentUser = AppUser.fromMap(userDoc.data()!);
        }

        // Load teacher's quizzes
        final quizzes = await _quizService.getTeacherQuizzes(authUser.uid);

        // Calculate stats
        setState(() {
          _totalQuizzes = quizzes.length;
          _activeSessions = quizzes.where((q) => q.isPublished).length; // Fixed to use isPublished instead of non-existent isActive field

          // Calculate unique students and average score from quiz results
          FirebaseFirestore.instance
              .collection('quiz_results')
              .where('instructorId', isEqualTo: authUser.uid)
              .get()
              .then((snapshot) {
            if (snapshot.docs.isNotEmpty) {
              final uniqueStudents = <String>{};
              double totalScore = 0;

              for (var doc in snapshot.docs) {
                final data = doc.data();
                uniqueStudents.add(data['studentId']);
                totalScore += (data['percentageScore'] ?? 0.0);
              }

              setState(() {
                _totalStudents = uniqueStudents.length;
                _avgScore = snapshot.docs.isNotEmpty
                    ? totalScore / snapshot.docs.length
                    : 0;
              });
            }
          });

          _isLoadingData = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading teacher data: $e');
      setState(() => _isLoadingData = false);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingData) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome, ${_currentUser?.name ?? "Teacher"}! 👋',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 30),
          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 15,
            crossAxisSpacing: 15,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _AnimatedStatCard(
                animationController: _animationController,
                delay: 0.0,
                icon: '📋',
                title: 'Total Quizzes',
                value: '$_totalQuizzes',
                color: AppTheme.primaryGold,
              ),
              _AnimatedStatCard(
                animationController: _animationController,
                delay: 0.1,
                icon: '🎮',
                title: 'Active Sessions',
                value: '$_activeSessions',
                color: AppTheme.accentGold,
              ),
              _AnimatedStatCard(
                animationController: _animationController,
                delay: 0.2,
                icon: '👥',
                title: 'Total Students',
                value: '$_totalStudents',
                color: AppTheme.accentGold,
              ),
              _AnimatedStatCard(
                animationController: _animationController,
                delay: 0.3,
                icon: '⭐',
                title: 'Avg Score',
                value: '${_avgScore.toStringAsFixed(1)}%',
                color: AppTheme.warmBrown,
              ),
            ],
          ),
          const SizedBox(height: 30),
          const Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                  const CreateQuizScreen(),
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) {
                    return SlideTransition(
                      position: animation.drive(
                        Tween(
                          begin: const Offset(1.0, 0.0),
                          end: Offset.zero,
                        ),
                      ),
                      child: child,
                    );
                  },
                ),
              ).then((_) {
                widget.onRefresh();
              });
            },
            icon: const Icon(Icons.add),
            label: const Text('Create New Quiz'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGold,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 8,
              shadowColor: AppTheme.primaryGold.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(context, '/teacher/reports');
            },
            icon: const Icon(Icons.assessment),
            label: const Text('View Reports'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentGold,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 8,
              shadowColor: AppTheme.accentGold.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 30),
          const Text(
            'Recent Quizzes',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 15),
          _buildRecentQuizzesWidget(),
        ],
      ),
    );
  }

  Widget _buildRecentQuizzesWidget() {
    final authUser = auth.FirebaseAuth.instance.currentUser;
    if (authUser == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            const Text('📋', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 10),
            Text(
              'Not logged in',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      );
    }

    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('quizzes')
          .where('instructorId', isEqualTo: authUser.uid)
          .orderBy('createdAt', descending: true) // Added: Order by creation date, newest first
          .limit(3) // Added: Limit to the 3 most recent quizzes
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                const Text('📋', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 10),
                Text(
                  'No quizzes yet\nCreate your first quiz',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          );
        }

        final quizzes = snapshot.data!.docs.map((doc) {
          return Quiz.fromMap(doc.data() as Map<String, dynamic>);
        }).toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt)); // Sort by newest first

        return Column(
          children: quizzes.take(3).map((quiz) { // Changed from .map to .take(3).map to ensure only 3 are displayed
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
                margin: const EdgeInsets.only(bottom: 15),
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.primaryGold.withOpacity(0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryGold.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 6,
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
                      gradient: AppTheme.goldGradient,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                        child: Text('📋', style: TextStyle(fontSize: 24))),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          quiz.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${quiz.totalQuestions} questions • PIN: ${quiz.pin}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward, color: Colors.grey),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

class _AnimatedStatCard extends StatelessWidget {
  final AnimationController animationController;
  final double delay;
  final String icon;
  final String title;
  final String value;
  final Color color;

  const _AnimatedStatCard({
    required this.animationController,
    required this.delay,
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final delayedAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: animationController,
        curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
      ),
    );

    return AnimatedBuilder(
      animation: delayedAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.8 + (delayedAnimation.value * 0.2),
          child: Opacity(
            opacity: delayedAnimation.value,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    color.withValues(alpha: 0.15),
                    color.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: color.withValues(alpha: 0.3), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(icon, style: const TextStyle(fontSize: 32)),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6B7280),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        value,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class QuizManagementContent extends StatefulWidget {
  final VoidCallback onRefresh;

  const QuizManagementContent({super.key, required this.onRefresh});

  @override
  State<QuizManagementContent> createState() => _QuizManagementContentState();
}

class _QuizManagementContentState extends State<QuizManagementContent> {
  List<Quiz> teacherQuizzes = [];
  final FirebaseQuizService _quizService = FirebaseQuizService();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    setState(() => _isLoading = true);
    try {
      final authUser = auth.FirebaseAuth.instance.currentUser;
      if (authUser != null) {
        final quizzes = await _quizService.getTeacherQuizzes(authUser.uid);
        setState(() {
          teacherQuizzes = quizzes;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading quizzes: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quiz Management',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                  const CreateQuizScreen(),
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) {
                    return SlideTransition(
                      position: animation.drive(
                        Tween(
                          begin: const Offset(1.0, 0.0),
                          end: Offset.zero,
                        ),
                      ),
                      child: child,
                    );
                  },
                ),
              ).then((_) {
                setState(() => _loadQuizzes());
                widget.onRefresh();
              });
            },
            icon: const Icon(Icons.add),
            label: const Text('Create New Quiz'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C4DFF),
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 20),
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (teacherQuizzes.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryGold.withValues(alpha: 0.1),
                    AppTheme.primaryGold.withValues(alpha: 0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryGold.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  const Text(
                    '📋',
                    style: TextStyle(fontSize: 48),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'No quizzes created yet\nTap "Create New Quiz" to get started',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: teacherQuizzes.length,
              itemBuilder: (context, index) {
                final quiz = teacherQuizzes[index];
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
                    margin: const EdgeInsets.only(bottom: 15),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
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
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  quiz.description,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.blue.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Active',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Questions: ${quiz.totalQuestions}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Participants: ${quiz.participantCount}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text(
                                'PIN:',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF6B7280),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF7C4DFF)
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: const Color(0xFF7C4DFF),
                                  ),
                                ),
                                child: Text(
                                  quiz.pin ?? '000000',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF7C4DFF),
                                    letterSpacing: 2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: const Text('Quiz PIN'),
                                    content: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Text(
                                          'Share this PIN with students:',
                                        ),
                                        const SizedBox(height: 20),
                                        Container(
                                          padding:
                                          const EdgeInsets.all(20),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF7C4DFF)
                                                .withValues(alpha: 0.1),
                                            borderRadius:
                                            BorderRadius.circular(12),
                                            border: Border.all(
                                              color:
                                              const Color(0xFF7C4DFF),
                                            ),
                                          ),
                                          child: Text(
                                            quiz.pin ?? '000000',
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
                                          'Questions: ${quiz.totalQuestions}\nTime: ${quiz.timePerQuestion}s per question',
                                          textAlign: TextAlign.center,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.pop(context),
                                        child: const Text('Close'),
                                      ),
                                    ],
                                  ),
                                );
                              },
                              icon: const Icon(Icons.share),
                              label: const Text('Share PIN'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2196F3),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: const Text('Delete Quiz?'),
                                    content: const Text(
                                      'Are you sure you want to delete this quiz? This action cannot be undone.',
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.pop(context),
                                        child: const Text('Cancel'),
                                      ),
                                      TextButton(
                                        onPressed: () async {
                                          try {
                                            await _quizService.deleteQuiz(quiz.pin ?? '');
                                            await _loadQuizzes();
                                            if (!context.mounted) return;
                                            Navigator.pop(context);
                                            widget.onRefresh();
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                content: Text('Quiz deleted ✓'),
                                                backgroundColor: Colors.red,
                                                behavior: SnackBarBehavior.floating,
                                              ),
                                            );
                                          } catch (e) {
                                            if (!context.mounted) return;
                                            Navigator.pop(context);
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text('Error: $e'),
                                                backgroundColor: Colors.red,
                                              ),
                                            );
                                          }
                                        },
                                        child: const Text('Delete'),
                                      ),
                                    ],
                                  ),
                                );
                              },
                              icon: const Icon(Icons.delete),
                              label: const Text('Delete'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                              ),
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
        ],
      ),
    );
  }
}

class AnalyticsContent extends StatefulWidget {
  const AnalyticsContent({super.key});

  @override
  State<AnalyticsContent> createState() => _AnalyticsContentState();
}

class _AnalyticsContentState extends State<AnalyticsContent>
    with TickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Analytics',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: 15,
            crossAxisSpacing: 15,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _AnimatedAnalyticsCard(
                animationController: _animationController,
                delay: 0.0,
                icon: '📊',
                title: 'Avg Performance',
                value: '76.5%',
              ),
              _AnimatedAnalyticsCard(
                animationController: _animationController,
                delay: 0.1,
                icon: '❓',
                title: 'Questions',
                value: '324',
              ),
              _AnimatedAnalyticsCard(
                animationController: _animationController,
                delay: 0.2,
                icon: '✅',
                title: 'Completion',
                value: '89%',
              ),
              _AnimatedAnalyticsCard(
                animationController: _animationController,
                delay: 0.3,
                icon: '👥',
                title: 'Active',
                value: '145',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AnimatedAnalyticsCard extends StatelessWidget {
  final AnimationController animationController;
  final double delay;
  final String icon;
  final String title;
  final String value;

  const _AnimatedAnalyticsCard({
    required this.animationController,
    required this.delay,
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final delayedAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: animationController,
        curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
      ),
    );

    return AnimatedBuilder(
      animation: delayedAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 0.8 + (delayedAnimation.value * 0.2),
          child: Opacity(
            opacity: delayedAnimation.value,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(icon, style: const TextStyle(fontSize: 32)),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6B7280),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        value,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class SettingsContent extends StatefulWidget {
  const SettingsContent({super.key});

  @override
  State<SettingsContent> createState() => _SettingsContentState();
}

class _SettingsContentState extends State<SettingsContent> {
  bool _notificationsEnabled = true;
  bool _emailUpdates = true;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Settings',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications,
                      color: Color(0xFF7C4DFF)),
                  title: const Text('Notifications'),
                  trailing: Switch(
                    value: _notificationsEnabled,
                    onChanged: (value) {
                      setState(
                              () => _notificationsEnabled = value);
                    },
                    activeThumbColor: const Color(0xFF7C4DFF),
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.email,
                      color: Color(0xFF2196F3)),
                  title: const Text('Email Updates'),
                  trailing: Switch(
                    value: _emailUpdates,
                    onChanged: (value) {
                      setState(() => _emailUpdates = value);
                    },
                    activeThumbColor: const Color(0xFF2196F3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
          const Text(
            'Account',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 15),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.security,
                      color: Color(0xFF7C4DFF)),
                  title: const Text('Change Password'),
                  trailing: const Icon(Icons.arrow_forward),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                        Text('Password change feature coming soon!'),
                        backgroundColor: Color(0xFF2196F3),
                        duration: Duration(seconds: 2),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.privacy_tip,
                      color: Color(0xFF2196F3)),
                  title: const Text('Privacy Policy'),
                  trailing: const Icon(Icons.arrow_forward),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Privacy Policy'),
                        content: const SingleChildScrollView(
                          child: Text(
                            'Your privacy is important to us. We collect and process your data in accordance with GDPR and local regulations. Your quiz data, scores, and personal information are encrypted and stored securely.',
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Close'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.help,
                      color: Color(0xFF4CAF50)),
                  title: const Text('Help & Support'),
                  trailing: const Icon(Icons.arrow_forward),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Help & Support'),
                        content: const SingleChildScrollView(
                          child: Text(
                            'For technical support, email: support@testhub.com\n\nFAQ:\n1. How do I create a quiz? Go to Dashboard > Create New Quiz\n2. How do students join? They use the 6-digit PIN\n3. Can I edit quizzes? Yes, delete and recreate\n4. How long is data stored? Indefinitely unless deleted',
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Close'),
                          ),
                        ],
                      ),
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
}

class UploadDocumentContent extends StatefulWidget {
  const UploadDocumentContent({super.key});

  @override
  State<UploadDocumentContent> createState() => _UploadDocumentContentState();
}

class _UploadDocumentContentState extends State<UploadDocumentContent> {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Upload Document',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Document upload feature coming soon! 📄'),
                  backgroundColor: Color(0xFF2196F3),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            icon: const Icon(Icons.upload),
            label: const Text('Upload Document'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C4DFF),
              minimumSize: const Size(double.infinity, 50),
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
