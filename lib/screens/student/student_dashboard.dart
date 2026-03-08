import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../config/app_theme.dart';
import '../../models/user_model.dart';
import '../../services/firebase_auth_service.dart';
import '../../services/firebase_quiz_service.dart';
import 'join_game_screen.dart';
import 'schedule/classes_screen.dart';
import 'schedule/subjects_screen.dart';
import 'schedule/exams_schedule_screen.dart';
import 'student_reports_screen.dart';
import 'student_dashboard_widgets.dart';
import 'browse_quizzes_screen.dart';
import 'leaderboard_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _selectedIndex = 0;
  final FirebaseAuthService _authService = FirebaseAuthService();
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

  List<Widget> get _screens => [
    StudentDashboardContent(onTabChange: (index) {
      setState(() {
        _selectedIndex = index;
      });
    }),
    StudentDiscoverContent(onTabChange: (index) {
      setState(() {
        _selectedIndex = index;
      });
    }),
    const JoinQuizContent(),
    const MyResultsContent(),
    const StudentProfileContent(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  // Profile Avatar
                  Builder(
                    builder: (context) => GestureDetector(
                      onTap: () {
                        Scaffold.of(context).openDrawer();
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
                          child: Text('👨‍🎓', style: TextStyle(fontSize: 22)),
                        ),
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
                        'Student Portal',
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
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('No new notifications')),
                        );
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
              colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
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
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                          ),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Center(
                          child: Text('👨‍🎓', style: TextStyle(fontSize: 36)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _currentUser?.name ?? 'Student',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _currentUser?.email ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                  child: Divider(color: Colors.white24, thickness: 1),
                ),
                _drawerItem(Icons.home, 'Home', 0),
                _drawerItem(Icons.explore, 'Discover', 1),
                _drawerItem(Icons.login, 'Join Quiz', 2),
                _drawerItem(Icons.assessment, 'My Results', 3),
                _drawerItem(Icons.person, 'Profile', 4),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                  child: Divider(color: Colors.white24, thickness: 1),
                ),
                _drawerNavItem(
                  Icons.class_,
                  'My Classes',
                  () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ClassesScreen(),
                      ),
                    );
                  },
                ),
                _drawerNavItem(
                  Icons.school,
                  'Subjects',
                  () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SubjectsScreen(),
                      ),
                    );
                  },
                ),
                _drawerNavItem(
                  Icons.event,
                  'Exam Schedule',
                  () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ExamsScheduleScreen(),
                      ),
                    );
                  },
                ),
                _drawerNavItem(
                  Icons.bar_chart,
                  'Reports',
                  () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const StudentReportsScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.all(15),
                  child: SizedBox(
                    width: double.infinity,
                    height: 48,
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
                      icon: const Icon(Icons.logout, size: 20),
                      label: const Text('Logout', style: TextStyle(fontSize: 16)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF44336),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
        children: _screens,
      ),
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
                _buildNavItem(Icons.home, 'Home', 0),
                _buildNavItem(Icons.explore, 'Discover', 1),
                _buildCenterNavItem(Icons.login, 'Join', 2),
                _buildNavItem(Icons.assessment, 'Results', 3),
                _buildNavItem(Icons.person, 'Profile', 4),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = _selectedIndex == index;
    return InkWell(
      onTap: () => setState(() => _selectedIndex = index),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2196F3).withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFF2196F3) : Colors.grey.shade600,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? const Color(0xFF2196F3) : Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterNavItem(IconData icon, String label, int index) {
    final isSelected = _selectedIndex == index;
    return InkWell(
      onTap: () => setState(() => _selectedIndex = index),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isSelected
                ? [const Color(0xFF2196F3), const Color(0xFF00BCD4)]
                : [Colors.grey.shade400, Colors.grey.shade500],
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: (isSelected ? const Color(0xFF2196F3) : Colors.grey).withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 28),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(IconData icon, String label, int index) {
    final isSelected = _selectedIndex == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? const Color(0xFF2196F3) : Colors.white70,
      ),
      title: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.white70,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      selectedTileColor: Colors.white.withValues(alpha: 0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      onTap: () {
        setState(() => _selectedIndex = index);
        Navigator.pop(context);
      },
    );
  }

  Widget _drawerNavItem(IconData icon, String label, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70),
      title: Text(
        label,
        style: const TextStyle(color: Colors.white70),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      onTap: onTap,
    );
  }
}


class StudentDashboardContent extends StatefulWidget {
  final Function(int)? onTabChange;

  const StudentDashboardContent({super.key, this.onTabChange});

  @override
  State<StudentDashboardContent> createState() =>
      _StudentDashboardContentState();
}

class _StudentDashboardContentState extends State<StudentDashboardContent>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  final FirebaseQuizService _quizService = FirebaseQuizService();
  AppUser? _currentUser;
  List<Map<String, dynamic>> _recentResults = [];
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animationController.forward();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final authUser = auth.FirebaseAuth.instance.currentUser;
      if (authUser != null) {
        // Load user profile
        final userDoc = await FirebaseFirestore.instance
            .collection('users')
            .doc(authUser.uid)
            .get();

        if (userDoc.exists) {
          _currentUser = AppUser.fromMap(userDoc.data()!);
        }

        final results = await _quizService.getStudentResults(authUser.uid);
        setState(() {
          _recentResults = results.take(3).map((result) => {
            'title': result.quizTitle ?? 'Quiz ${result.quizId.substring(0, 6)}',
            'score': result.percentageScore ?? (result.score / result.totalQuestions * 100),
            'rank': result.rank ?? 0,
            'daysAgo': DateTime.now().difference(result.completedAt).inDays,
          }).toList();
          _isLoadingData = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading student data: $e');
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
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2196F3), Color(0xFF00BCD4)],
              ),
              borderRadius: BorderRadius.circular(15),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2196F3).withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('👋', style: TextStyle(fontSize: 32)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Welcome Back, ${_currentUser?.name ?? "Student"}!',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Ready to continue learning?',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
          StreamBuilder<QuerySnapshot>(
            stream: FirebaseFirestore.instance
                .collection('quiz_results')
                .where('studentId', isEqualTo: auth.FirebaseAuth.instance.currentUser?.uid)
                .snapshots(),
            builder: (context, snapshot) {
              int quizzesTaken = 0;
              double avgScore = 0;
              int weakTopics = 0;
              int myRank = 0;

              if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
                quizzesTaken = snapshot.data!.docs.length;

                // Calculate average score
                double totalScore = 0;
                for (var doc in snapshot.data!.docs) {
                  final data = doc.data() as Map<String, dynamic>;
                  totalScore += (data['percentageScore'] ?? 0.0);
                }
                avgScore = quizzesTaken > 0 ? totalScore / quizzesTaken : 0;

                // Calculate weak topics (score < 60%)
                weakTopics = snapshot.data!.docs
                    .where((doc) => ((doc.data() as Map<String, dynamic>)['percentageScore'] ?? 0) < 60)
                    .length;
              }

              return GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 15,
                crossAxisSpacing: 15,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.1,
                children: [
                  _AnimatedStatCard(
                    animationController: _animationController,
                    delay: 0.0,
                    iconData: Icons.assignment_turned_in,
                    title: 'Quizzes Taken',
                    value: '$quizzesTaken',
                    color: const Color(0xFF2196F3),
                    onTap: () => widget.onTabChange?.call(3),
                  ),
                  _AnimatedStatCard(
                    animationController: _animationController,
                    delay: 0.1,
                    iconData: Icons.star,
                    title: 'Avg Score',
                    value: '${avgScore.toStringAsFixed(1)}%',
                    color: const Color(0xFFFFC107),
                    onTap: () => widget.onTabChange?.call(3),
                  ),
                  _AnimatedStatCard(
                    animationController: _animationController,
                    delay: 0.2,
                    iconData: Icons.warning_amber_rounded,
                    title: 'Weak Topics',
                    value: '$weakTopics',
                    color: const Color(0xFFFF5722),
                    onTap: () => widget.onTabChange?.call(3),
                  ),
                  _AnimatedStatCard(
                    animationController: _animationController,
                    delay: 0.3,
                    iconData: Icons.emoji_events,
                    title: 'My Rank',
                    value: myRank > 0 ? '#$myRank' : '-',
                    color: const Color(0xFF4CAF50),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LeaderboardScreen(),
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 30),
          GestureDetector(
            onTap: () {
              // Navigate to Join Game tab
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const JoinGameScreen(),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF00BCD4), Color(0xFF0097A7)],
                ),
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00BCD4).withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.videogame_asset, size: 48, color: Colors.white),
                  const SizedBox(width: 20),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Join a Live Game',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Enter PIN to join',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Join',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0097A7),
                          ),
                        ),
                        SizedBox(width: 6),
                        Icon(
                          Icons.arrow_forward,
                          size: 18,
                          color: Color(0xFF0097A7),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const BrowseQuizzesScreen(),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4CAF50), Color(0xFF2E7D32)],
                ),
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4CAF50).withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.library_books, size: 48, color: Colors.white),
                  const SizedBox(width: 20),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Browse Quizzes',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Find and join quizzes by topic',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Browse',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        SizedBox(width: 6),
                        Icon(
                          Icons.arrow_forward,
                          size: 18,
                          color: Color(0xFF2E7D32),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const StudentReportsScreen(),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                ),
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2196F3).withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.analytics, size: 48, color: Colors.white),
                  const SizedBox(width: 20),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'View Reports',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'See all your quiz results',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'View',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2196F3),
                          ),
                        ),
                        SizedBox(width: 6),
                        Icon(
                          Icons.arrow_forward,
                          size: 18,
                          color: Color(0xFF2196F3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          Text(
            'Recent Results',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 15),
          _buildRecentResultsStream(),
        ],
      ),
    );
  }

  Widget _buildRecentResultsStream() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('quiz_results')
          .where('studentId', isEqualTo: auth.FirebaseAuth.instance.currentUser?.uid)
          .orderBy('completedAt', descending: true)
          .limit(3)
          .snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return Container(
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
                  'No quiz results yet\nJoin a quiz to get started!',
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

        final results = snapshot.data!.docs.map((doc) => doc.data() as Map<String, dynamic>).toList();

        return Column(
          children: results.map((result) {
            final score = result['percentageScore'] ?? 0.0; // Use percentageScore which is 0-100 based on play_screen.dart
            final completedAt = (result['completedAt'] as Timestamp?)?.toDate() ?? DateTime.now();
            final daysAgo = DateTime.now().difference(completedAt).inDays;
            
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5E5EB)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 5,
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
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Center(
                      child: Icon(Icons.assignment, color: Colors.white, size: 24),
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          result['quizTitle'] ?? 'Quiz',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          daysAgo == 0 ? 'Today' : (daysAgo == 1 ? 'Yesterday' : '$daysAgo days ago'),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${score.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: score >= 70
                              ? const Color(0xFF00C853)
                              : const Color(0xFFF44336),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildClassItem(String subject, String time, String teacher, bool isLive) {
    return Row(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: isLive ? const Color(0xFFE3F2FD) : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Icon(
              Icons.class_,
              color: isLive ? const Color(0xFF2196F3) : Colors.grey,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subject,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$time • $teacher',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
        if (isLive)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFFEBEE),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'LIVE',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFFF44336),
              ),
            ),
          ),
      ],
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
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(15),
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
                            style: TextStyle(
                              fontSize: 12,
                              color: const Color(0xFF6B7280),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            value,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF1F2937),
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

class LeaderboardContent extends StatelessWidget {
  const LeaderboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            'Leaderboard',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.leaderboardTitleColor, // Used AppTheme for title color
            ),
          ),
          const SizedBox(height: 30),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryColor, AppTheme.secondaryColor], // Used AppTheme for gradient colors
              ),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Rank',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.leaderboardSubTextColor, // Used AppTheme for subtext color
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '#12',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Score: 2,450 pts',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.leaderboardScoreColor.withValues(alpha: 0.8), // Used AppTheme for score color
                      ),
                    ),
                  ],
                ),
                const Text('🏆', style: TextStyle(fontSize: 64)),
              ],
            ),
          ),
          const SizedBox(height: 30),
          Text(
            'Top Scorers',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.topScorersTextColor, // Used AppTheme for text color
            ),
          ),
          const SizedBox(height: 15),
          ..._buildLeaderboardList(),
        ],
      ),
    );
  }

  List<Widget> _buildLeaderboardList() {
    final medals = ['🥇', '🥈', '🥉'];
    final names = [
      'Ahmed Ali',
      'Fatima Khan',
      'Hassan Raza',
      'Sara Ahmed',
      'Ali Khan'
    ];
    final scores = [100, 95, 90, 88, 85];

    return List.generate(5, (index) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: index < 3
              ? AppTheme.topScorersMedalColor.withValues(alpha: 0.1) // Used AppTheme for medal color
              : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: index < 3
                ? AppTheme.topScorersMedalColor.withValues(alpha: 0.3) // Used AppTheme for medal color
                : AppTheme.topScorersBorderColor, // Used AppTheme for border color
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 45,
              height: 45,
              decoration: BoxDecoration(
                color: index < 3
                    ? AppTheme.topScorersMedalColor.withValues(alpha: 0.2) // Used AppTheme for medal color
                    : AppTheme.topScorersCircleColor, // Used AppTheme for circle color
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  index < 3 ? medals[index] : '${index + 1}',
                  style: const TextStyle(fontSize: 24),
                ),
              ),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    names[index],
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.topScorersNameColor, // Used AppTheme for name color
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Grade 10',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.topScorersGradeColor, // Used AppTheme for grade color
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '${scores[index]}%',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.topScorersScoreColor, // Used AppTheme for score color
              ),
            ),
          ],
        ),
      );
    });
  }
}

class StudentSettingsContent extends StatefulWidget {
  const StudentSettingsContent({super.key});

  @override
  State<StudentSettingsContent> createState() =>
      _StudentSettingsContentState();
}

class _StudentSettingsContentState extends State<StudentSettingsContent> {
  bool _notificationsEnabled = true;
  String _selectedTheme = 'Light';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            'Settings',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.settingsTitleColor, // Used AppTheme for title color
            ),
          ),
          const SizedBox(height: 30),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: AppTheme.settingsBorderColor), // Used AppTheme for border color
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Profile',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.settingsProfileTextColor, // Used AppTheme for profile text color
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.settingsProfilePrimaryColor, // Used AppTheme for profile primary color
                            AppTheme.settingsProfileSecondaryColor, // Used AppTheme for profile secondary color
                          ],
                        ),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text('👩‍🎓',
                            style: TextStyle(fontSize: 40)),
                      ),
                    ),
                    const SizedBox(width: 20),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Fatima Khan',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'fatima@school.com',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Edit Profile feature coming soon!'),
                          backgroundColor: AppTheme.primaryColor, // Used AppTheme for background color
                          duration: Duration(seconds: 2),
                        ),
                      );
                    }, // Used AppTheme for text color
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.buttonBackgroundColor, // Used AppTheme for background color
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Edit Profile', style: TextStyle(color: AppTheme.buttonTextColor)),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Notifications',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.settingsNotificationsTextColor, // Used AppTheme for notifications text color
                  ),
                ),
                const SizedBox(height: 20),
                SwitchListTile(
                  title: Text('Enable Notifications', style: TextStyle(color: AppTheme.settingsNotificationsSubTextColor)), // Used AppTheme for notifications subtext color
                  value: _notificationsEnabled,
                  onChanged: (value) {
                    setState(() {
                      _notificationsEnabled = value;
                    });
                  },
                  activeThumbColor: AppTheme.settingsNotificationsActiveColor, // Used AppTheme for active color
                  inactiveTrackColor: AppTheme.settingsNotificationsInactiveColor, // Used AppTheme for inactive color
                ),
                const SizedBox(height: 20),
                Text(
                  'Theme',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.settingsThemeTextColor, // Used AppTheme for theme text color
                  ),
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  initialValue: _selectedTheme,
                  onChanged: (value) {
                    setState(() {
                      _selectedTheme = value!;
                    });
                  },
                  items: ['Light', 'Dark'].map((theme) {
                    return DropdownMenuItem<String>(
                      value: theme,
                      child: Text(theme, style: TextStyle(color: AppTheme.settingsThemeSubTextColor)), // Used AppTheme for theme subtext color
                    );
                  }).toList(),
                  decoration: InputDecoration(
                    labelText: 'Select Theme',
                    labelStyle: TextStyle(color: AppTheme.settingsThemeLabelColor), // Used AppTheme for label color
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppTheme.settingsThemeBorderColor), // Used AppTheme for border color
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: AppTheme.settingsThemeFocusedBorderColor), // Used AppTheme for focused border color
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
