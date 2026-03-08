import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';
import 'quiz_results_screen.dart';

class StudentReportsScreen extends StatefulWidget {
  const StudentReportsScreen({super.key});

  @override
  State<StudentReportsScreen> createState() => _StudentReportsScreenState();
}

class _StudentReportsScreenState extends State<StudentReportsScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();
  List<QuizResult> _allResults = [];
  bool _isLoading = true;
  String _selectedFilter = 'All';

  @override
  void initState() {
    super.initState();
    _loadResults();
  }

  Future<void> _loadResults() async {
    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        final results = await _quizService.getStudentResults(currentUser.uid);
        setState(() {
          _allResults = results;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[v0] Error loading results: $e');
      setState(() => _isLoading = false);
    }
  }

  List<QuizResult> get _filteredResults {
    if (_selectedFilter == 'All') return _allResults;
    if (_selectedFilter == 'Passed') {
      return _allResults.where((r) => (r.percentageScore ?? 0) >= 60).toList();
    }
    return _allResults.where((r) => (r.percentageScore ?? 0) < 60).toList();
  }

  @override
  Widget build(BuildContext context) {
    const primaryPurple = Color(0xFF7C4DFF);
    const secondaryPurple = Color(0xFF6A1B9A);

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: primaryPurple,
        title: const Text(
          'My Reports',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
            color: Colors.white,
          ),
        ),
        elevation: 0,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Header Section
          Container(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [primaryPurple, secondaryPurple],
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                // Stats Row
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Total',
                        '${_allResults.length}',
                        Icons.assignment_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        'Avg Score',
                        _allResults.isEmpty
                            ? '0%'
                            : '${(_allResults.map((r) => r.percentageScore ?? 0).reduce((a, b) => a + b) / _allResults.length).toStringAsFixed(1)}%',
                        Icons.analytics_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        'Passed',
                        '${_allResults.where((r) => (r.percentageScore ?? 0) >= 60).length}',
                        Icons.check_circle_outline,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Filter Bar (Segmented Look)
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Row(
                    children: ['All', 'Passed', 'Failed'].map((filter) {
                      final isSelected = _selectedFilter == filter;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedFilter = filter),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.1),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      )
                                    ]
                                  : [],
                            ),
                            child: Center(
                              child: Text(
                                filter,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight:
                                      isSelected ? FontWeight.bold : FontWeight.w500,
                                  color: isSelected
                                      ? primaryPurple
                                      : Colors.white.withValues(alpha: 0.9),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredResults.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('📋', style: TextStyle(fontSize: 64)),
                  const SizedBox(height: 20),
                  Text(
                    'No results found',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            )
                : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: _filteredResults.length,
              itemBuilder: (context, index) {
                final result = _filteredResults[index];
                final score = result.percentageScore ?? 0;
                final isPassed = score >= 60;

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => QuizResultsScreen(
                          result: result,
                        ),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 15),
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isPassed
                            ? const Color(0xFF4CAF50)
                            : const Color(0xFFFF5252),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withValues(alpha: 0.1),
                          blurRadius: 5,
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
                            color: (isPassed
                                ? const Color(0xFF4CAF50)
                                : const Color(0xFFFF5252))
                                .withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              isPassed ? '✓' : '✗',
                              style: TextStyle(
                                fontSize: 32,
                                color: isPassed
                                    ? const Color(0xFF4CAF50)
                                    : const Color(0xFFFF5252),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                            CrossAxisAlignment.start,
                            children: [
                              Text(
                                result.quizTitle ??
                                    'Quiz ${result.quizId.substring(0, 6)}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1F2937),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${DateTime.now().difference(result.completedAt).inDays} days ago',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${result.score}/${result.totalQuestions} correct',
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
                            Text(
                              '${score.toStringAsFixed(1)}%',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: isPassed
                                    ? const Color(0xFF4CAF50)
                                    : const Color(0xFFFF5252),
                              ),
                            ),
                            if (result.rank != null && result.rank! > 0)
                              Text(
                                'Rank #${result.rank}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey.shade600,
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
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white.withValues(alpha: 0.9), size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }
}
