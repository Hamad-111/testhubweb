import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool _isLoading = true;
  int _totalGames = 0;
  int _totalQuestions = 0;
  double _avgScore = 0.0;
  Map<String, int> _quizzesPerSubject = {};

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    try {
      final resultsSnapshot = await FirebaseFirestore.instance.collection('quiz_results').get();
      final quizzesSnapshot = await FirebaseFirestore.instance.collection('quizzes').get();

      int games = resultsSnapshot.size;
      int questions = 0;
      double totalPercentage = 0;
      Map<String, int> subjects = {};

      for (var doc in resultsSnapshot.docs) {
        final data = doc.data();
        totalPercentage += (data['percentageScore'] ?? 0).toDouble();
      }

      for (var doc in quizzesSnapshot.docs) {
        final data = doc.data();
        questions += (data['questions'] as List? ?? []).length;
        String subject = data['subject'] ?? 'Unknown';
        subjects[subject] = (subjects[subject] ?? 0) + 1;
      }

      if (mounted) {
        setState(() {
          _totalGames = games;
          _totalQuestions = questions;
          _avgScore = games > 0 ? totalPercentage / games : 0;
          _quizzesPerSubject = subjects;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching analytics: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('Platform Analytics', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF46178F),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchAnalytics,
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF46178F)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Key Performance Indicators',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 20),
                  _buildMetricCard('Total Games Played', '$_totalGames', Icons.sports_esports, Colors.purple),
                  const SizedBox(height: 12),
                  _buildMetricCard('Questions Answered', '$_totalQuestions', Icons.quiz, Colors.blue),
                  const SizedBox(height: 12),
                  _buildMetricCard('Platform Avg Score', '${_avgScore.toStringAsFixed(1)}%', Icons.analytics, Colors.orange),
                  const SizedBox(height: 32),
                  const Text(
                    'Content Distribution',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      children: _quizzesPerSubject.entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(e.key, style: const TextStyle(fontWeight: FontWeight.bold)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.indigo[50],
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${e.value} Quizzes',
                                  style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
              ),
              Text(
                title,
                style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
