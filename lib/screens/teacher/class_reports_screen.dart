import 'package:flutter/material.dart';

class ClassReportsScreen extends StatefulWidget {
  const ClassReportsScreen({super.key});

  @override
  State<ClassReportsScreen> createState() => _ClassReportsScreenState();
}

class _ClassReportsScreenState extends State<ClassReportsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Class Reports'),
        backgroundColor: const Color(0xFF1F2937),
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1F2937), Color(0xFF111827)],
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Class Performance',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              Card(
                color: const Color(0xFF374151),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Class A - Average Score: 78.5%',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      LinearProgressIndicator(
                        value: 0.785,
                        minHeight: 8,
                        backgroundColor: Colors.grey[700],
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.green[400]!),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Top Performers:',
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        '1. John Doe - 92%',
                        style: TextStyle(color: Color(0xFFD1D5DB)),
                      ),
                      const Text(
                        '2. Jane Smith - 89%',
                        style: TextStyle(color: Color(0xFFD1D5DB)),
                      ),
                      const Text(
                        '3. Ali Khan - 86%',
                        style: TextStyle(color: Color(0xFFD1D5DB)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  // Export report as CSV/Excel
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  minimumSize: const Size(double.infinity, 45),
                ),
                child: const Text('Export Report as CSV'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
