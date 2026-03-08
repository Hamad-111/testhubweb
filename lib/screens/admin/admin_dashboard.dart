import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/firebase_auth_service.dart';
import 'user_management_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  bool _isLoading = true;
  int _teacherCount = 0;
  int _studentCount = 0;
  int _quizCount = 0;
  int _resultCount = 0;
  int _pendingInstructorCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final usersRef = FirebaseFirestore.instance.collection('users');
      final quizzesRef = FirebaseFirestore.instance.collection('quizzes');
      final resultsRef = FirebaseFirestore.instance.collection('quiz_results');

      final teachers = await usersRef.where('role', isEqualTo: 'instructor').where('status', isEqualTo: 'active').get();
      final students = await usersRef.where('role', isEqualTo: 'student').get();
      final quizzes = await quizzesRef.get();
      final results = await resultsRef.get();
      final pending = await usersRef.where('role', isEqualTo: 'instructor').where('status', isEqualTo: 'pending').get();

      if (mounted) {
        setState(() {
          _teacherCount = teachers.size;
          _studentCount = students.size;
          _quizCount = quizzes.size;
          _resultCount = results.size;
          _pendingInstructorCount = pending.size;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching admin stats: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF46178F),
        elevation: 0,
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF46178F)),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.admin_panel_settings, color: Color(0xFF46178F), size: 40),
              ),
              accountName: const Text('Administrator', style: TextStyle(fontWeight: FontWeight.bold)),
              accountEmail: Text(FirebaseAuthService().currentUser?.email ?? 'admin@testhub.com'),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              selected: true,
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.manage_accounts),
              title: const Text('User Management'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/admin/user_management');
              },
            ),
            ListTile(
              leading: const Icon(Icons.verified_user),
              title: const Text('Approve Requests'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/admin/approve_instructors');
              },
            ),
            ListTile(
              leading: const Icon(Icons.analytics),
              title: const Text('Global Analytics'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/admin/analytics');
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout', style: TextStyle(color: Colors.red)),
              onTap: () async {
                await FirebaseAuthService().signOut();
                if (context.mounted) {
                  Navigator.of(context).pushNamedAndRemoveUntil('/login_portal', (route) => false);
                }
              },
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF3F4F6),
          ),
          child: _isLoading 
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF46178F)))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Platform Status',
                      style: TextStyle(
                        color: Color(0xFF111827), 
                        fontSize: 24, 
                        fontWeight: FontWeight.w900
                      ),
                    ),
                    const SizedBox(height: 20),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.1,
                      children: [
                        _buildStatCard(
                          'Instructors', 
                          '$_teacherCount', 
                          Icons.person_pin, 
                          Colors.indigo,
                          () => Navigator.push(context, MaterialPageRoute(builder: (context) => const UserManagementScreen(initialRole: 'instructor')))
                        ),
                        _buildStatCard(
                          'Students', 
                          '$_studentCount', 
                          Icons.people, 
                          Colors.green,
                          () => Navigator.push(context, MaterialPageRoute(builder: (context) => const UserManagementScreen(initialRole: 'student')))
                        ),
                        _buildStatCard(
                          'Total Quizzes', 
                          '$_quizCount', 
                          Icons.quiz, 
                          Colors.orange,
                          () => Navigator.pushNamed(context, '/admin/analytics')
                        ),
                        _buildStatCard(
                          'Quiz Attempts', 
                          '$_resultCount', 
                          Icons.rocket_launch, 
                          Colors.pink,
                          () => Navigator.pushNamed(context, '/admin/analytics')
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      'Management Actions',
                      style: TextStyle(
                        color: Color(0xFF111827), 
                        fontSize: 20, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildActionButton(
                      'User Management', 
                      'Control and monitor all users',
                      Icons.manage_accounts, 
                      const Color(0xFF46178F),
                      () => Navigator.pushNamed(context, '/admin/user_management')
                    ),
                    _buildActionButton(
                      'Approve Requests', 
                      _pendingInstructorCount > 0 
                        ? '$_pendingInstructorCount new requests waiting' 
                        : 'No pending instructor profiles',
                      Icons.verified_user, 
                      Colors.green,
                      () => Navigator.pushNamed(context, '/admin/approve_instructors')
                    ),
                    _buildActionButton(
                      'Global Analytics', 
                      'Detailed performance metrics',
                      Icons.analytics, 
                      Colors.blue,
                      () => Navigator.pushNamed(context, '/admin/analytics')
                    ),
                  ],
                ),
              ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, VoidCallback onTap) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 32),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      color: Color(0xFF111827), 
                      fontSize: 24, 
                      fontWeight: FontWeight.w900
                    ),
                  ),
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.grey[600], 
                      fontSize: 12,
                      fontWeight: FontWeight.bold
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

  Widget _buildActionButton(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title, 
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: Colors.grey[500], fontSize: 12)
        ),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFFD1D5DB)),
        onTap: onTap,
      ),
    );
  }
}
