import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/quiz_models.dart';
import '../../models/user_model.dart';
import '../../services/firebase_quiz_service.dart';
import 'create_quiz_screen.dart';
import 'quiz_session_screen.dart';
import 'new_dashboard_widgets.dart';

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _selectedIndex = 0;
  AppUser? _currentUser;
  bool _isLoadingUser = true;

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
  }

  Future<void> _loadCurrentUser() async {
    try {
      final authUser = auth.FirebaseAuth.instance.currentUser;
      if (authUser != null) {
        final userDoc = await FirebaseFirestore.instance
            .collection('users')
            .doc(authUser.uid)
            .get();

        if (userDoc.exists) {
          setState(() {
            _currentUser = AppUser.fromMap(userDoc.data()!);
            _isLoadingUser = false;
          });
        }
      }
    } catch (e) {
      debugPrint('[v0] Error loading user: $e');
      setState(() => _isLoadingUser = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF5F5F5),
      // Custom App Bar
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF7C4DFF), Color(0xFF6A1B9A)],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  // Profile Avatar
                  GestureDetector(
                    onTap: () {
                      _scaffoldKey.currentState?.openDrawer();
                    },
                    child: Container(
                      width: 45,
                      height: 45,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Center(
                        child: Text('👨‍🏫', style: TextStyle(fontSize: 22)),
                      ),
                    ),
                  ),
                  const Spacer(),
                  // App Logo/Title
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Test Hub',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        'Teacher Portal',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.white.withValues(alpha: 0.8),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Notification Icon
                  Container(
                    width: 45,
                    height: 45,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 24),
                      onPressed: () {
                        // TODO: Show notifications
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      drawer: Drawer(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF7C4DFF), Color(0xFF6A1B9A)],
            ),
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
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.3),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Center(
                          child: Text('👨‍🏫', style: TextStyle(fontSize: 40)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentUser?.name ?? 'Teacher',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _currentUser?.email ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(color: Colors.white24, thickness: 1),
                const SizedBox(height: 10),
                _buildDrawerItem(Icons.settings, 'Settings', () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => Scaffold(
                        appBar: AppBar(
                          title: const Text('Settings'),
                          backgroundColor: const Color(0xFF7C4DFF),
                          foregroundColor: Colors.white,
                        ),
                        body: const SettingsContent(),
                      ),
                    ),
                  );
                }),
                _buildDrawerItem(Icons.help_outline, 'Help & Support', () {
                  Navigator.pop(context);
                }),
                _buildDrawerItem(Icons.info_outline, 'About', () {
                  Navigator.pop(context);
                }),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: SizedBox(
                    width: double.infinity,
                    height: 45,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final authService = auth.FirebaseAuth.instance;
                        await authService.signOut();
                        debugPrint('[v0] User signed out successfully');
                        
                        if (context.mounted) {
                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/',
                            (route) => false,
                          );
                        }
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
          TeacherDashboardContent(onRefresh: () => setState(() {})),
          DiscoverContent(
            onTabChange: (index) => setState(() => _selectedIndex = index),
          ),
          const CreateTestContent(),
          const MyTestsContent(),
          const ProfileContent(),
        ],
      ),
      // Bottom Navigation Bar
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.home, 'Home'),
                _buildNavItem(1, Icons.explore, 'Discover'),
                _buildNavItem(2, Icons.add_circle, 'Create', isCenter: true),
                _buildNavItem(3, Icons.quiz, 'My Tests'),
                _buildNavItem(4, Icons.person, 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isCenter = false}) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF7C4DFF).withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFF7C4DFF) : Colors.grey,
              size: isCenter ? 32 : 26,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? const Color(0xFF7C4DFF) : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String label, VoidCallback onTap) {
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
      onTap: onTap,
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
            setState(() {
                _currentUser = AppUser.fromMap(userDoc.data()!);
            });
        }
        
        setState(() {
          _isLoadingData = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading teacher data: $e');
      if (mounted) {
        setState(() => _isLoadingData = false);
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_currentUser == null && _isLoadingData) {
      return const Center(child: CircularProgressIndicator());
    }

    final authUser = auth.FirebaseAuth.instance.currentUser;
    if (authUser == null) return const SizedBox.shrink();

    return StreamBuilder<List<Quiz>>(
      stream: _quizService.getTeacherQuizzesStream(authUser.uid),
      builder: (context, quizSnapshot) {
        final quizzes = quizSnapshot.data ?? [];
        final totalQuizzes = quizzes.length;
        final activeSessions = quizzes.where((q) => q.isPublished).length;

        return StreamBuilder<List<QuizResult>>(
          stream: _quizService.getTeacherResultsStream(authUser.uid),
          builder: (context, resultSnapshot) {
            final results = resultSnapshot.data ?? [];
            
            double avgScore = 0;
            if (results.isNotEmpty) {
              final totalPercentage = results.fold(0.0, (sum, r) => sum + (r.percentageScore ?? 0.0));
              avgScore = totalPercentage / results.length;
            }

            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('users')
                  .where('role', isEqualTo: 'student')
                  .snapshots(),
              builder: (context, studentSnapshot) {
                final totalStudents = studentSnapshot.data?.docs.length ?? 0;

                return SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Welcome Header
                      Container(
                        margin: const EdgeInsets.all(20),
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF7C4DFF), Color(0xFF6A1B9A)],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF7C4DFF).withValues(alpha: 0.3),
                              blurRadius: 15,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome back,',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.white.withValues(alpha: 0.9),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _currentUser?.name ?? 'Teacher',
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: const Center(
                                child: Text('👨‍🏫', style: TextStyle(fontSize: 30)),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Stats Grid
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        mainAxisSpacing: 15,
                        crossAxisSpacing: 15,
                        children: [
                          _AnimatedStatCard(
                            animationController: _animationController,
                            delay: 0.1,
                            iconData: Icons.assignment,
                            title: 'Total Quizzes',
                            value: '$totalQuizzes',
                            color: const Color(0xFF7C4DFF),
                            onTap: () {
                              final dashboardState = context.findAncestorStateOfType<State<TeacherDashboard>>();
                              if (dashboardState != null) {
                                (dashboardState as dynamic).setState(() {
                                  (dashboardState as dynamic)._selectedIndex = 3;
                                });
                              }
                            },
                          ),
                          _AnimatedStatCard(
                            animationController: _animationController,
                            delay: 0.2,
                            iconData: Icons.check_circle,
                            title: 'Active Sessions',
                            value: '$activeSessions',
                            color: const Color(0xFF00C853),
                            onTap: () {
                               final dashboardState = context.findAncestorStateOfType<State<TeacherDashboard>>();
                               if (dashboardState != null) {
                                 (dashboardState as dynamic).setState(() {
                                   (dashboardState as dynamic)._selectedIndex = 3;
                                 });
                               }
                            },
                          ),
                          _AnimatedStatCard(
                            animationController: _animationController,
                            delay: 0.3,
                            iconData: Icons.people,
                            title: 'Total Students',
                            value: '$totalStudents',
                            color: const Color(0xFF2196F3),
                            onTap: () => _showStudentsList(context, totalStudents),
                          ),
                          _AnimatedStatCard(
                            animationController: _animationController,
                            delay: 0.4,
                            iconData: Icons.star,
                            title: 'Avg. Score',
                            value: '${avgScore.toStringAsFixed(1)}%',
                            color: const Color(0xFFFFD600),
                            onTap: () => _showStudentsList(context, totalStudents),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Recent Quizzes Header
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: Text(
                          'Recent Quizzes',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Recent Quizzes List
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _buildRecentQuizzesWidget(),
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildActionButton(
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: color),
          ],
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Quiz quiz) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Quiz'),
        content: Text('Are you sure you want to delete "${quiz.title}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
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
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showStudentsList(BuildContext context, int studentCount) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 20),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Students List',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2196F3).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$studentCount Students',
                      style: const TextStyle(
                        color: Color(0xFF2196F3),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Divider(),
            // Student List
            Expanded(
              child: StreamBuilder<QuerySnapshot>(
                stream: FirebaseFirestore.instance
                    .collection('users')
                    .where('role', isEqualTo: 'student')
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
                          Icon(Icons.people_outline, size: 64, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          Text(
                            'No students found',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    );
                  }

                  final students = snapshot.data!.docs;

                  return ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: students.length,
                    itemBuilder: (context, index) {
                      final student = students[index].data() as Map<String, dynamic>;
                      final studentId = students[index].id;
                      final rawName = (student['name'] ?? '').toString().trim();
                      final name = rawName.isNotEmpty ? rawName : 'Unknown Student';
                      final email = student['email'] ?? 'No email';
                      
                      return FutureBuilder<QuerySnapshot>(
                        future: FirebaseFirestore.instance
                            .collection('quiz_results')
                            .where('studentId', isEqualTo: studentId)
                            .get(),
                        builder: (context, resultsSnapshot) {
                          String avgScore = '-';
                          int quizzesTaken = 0;
                          
                          if (resultsSnapshot.hasData) {
                            final results = resultsSnapshot.data!.docs;
                            quizzesTaken = results.length;
                            if (quizzesTaken > 0) {
                              double totalScore = 0;
                              for (var result in results) {
                                totalScore += (result.data() as Map<String, dynamic>)['percentageScore'] ?? 0;
                              }
                              avgScore = '${(totalScore / quizzesTaken).toStringAsFixed(1)}%';
                            }
                          }

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
                              border: Border.all(color: Colors.grey.shade100),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFF2196F3), Color(0xFF00BCD4)],
                                    ),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF2196F3).withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: Text(
                                      name.substring(0, 1).toUpperCase(),
                                      style: const TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
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
                                        name,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1F2937),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        email,
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
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF4CAF50).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        avgScore,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF4CAF50),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '$quizzesTaken quizzes',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.grey.shade500,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
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
                const Icon(Icons.assignment_outlined, size: 48, color: Colors.grey),
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

        // Client-side sorting because Firestore composite index might be missing
        final quizzes = snapshot.data!.docs.map((doc) {
          return Quiz.fromMap(doc.data() as Map<String, dynamic>);
        }).toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

        return Column(
          children: quizzes.take(10).map((quiz) {
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
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE5E5EB)),
                ),
                child: Row(
                  children: [
                    Container(
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
  final IconData iconData;
  final String title;
  final String value;
  final Color color;
  final VoidCallback? onTap;

  const _AnimatedStatCard({
    required this.animationController,
    required this.delay,
    required this.iconData,
    required this.title,
    required this.value,
    required this.color,
    this.onTap,
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
            child: GestureDetector(
              onTap: onTap,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      color.withValues(alpha: 0.1),
                      color.withValues(alpha: 0.05),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: color.withValues(alpha: 0.2)),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(iconData, size: 32, color: color),
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
                return Container(
                  margin: const EdgeInsets.only(bottom: 15),
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
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
                                  quiz.description ?? 'No description',
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
                                            if (mounted) {
                                              Navigator.pop(context);
                                              widget.onRefresh();
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('Quiz deleted ✓'),
                                                  backgroundColor: Colors.red,
                                                  behavior: SnackBarBehavior.floating,
                                                ),
                                              );
                                            }
                                          } catch (e) {
                                            if (mounted) {
                                              Navigator.pop(context);
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Error: $e'),
                                                  backgroundColor: Colors.red,
                                                ),
                                              );
                                            }
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
