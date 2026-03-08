import 'package:flutter/material.dart';

class MyProgressScreen extends StatefulWidget {
  const MyProgressScreen({super.key});

  @override
  State<MyProgressScreen> createState() => _MyProgressScreenState();
}

class _MyProgressScreenState extends State<MyProgressScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Progress'),
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
        child: const SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Overall Performance',
                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 16),
              Card(
                color: Color(0xFF374151),
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            children: [
                              Text('82.5%', style: TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.bold)),
                              Text('Avg Score', style: TextStyle(color: Color(0xFFD1D5DB))),
                            ],
                          ),
                          Column(
                            children: [
                              Text('45', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 24, fontWeight: FontWeight.bold)),
                              Text('Quizzes Taken', style: TextStyle(color: Color(0xFFD1D5DB))),
                            ],
                          ),
                          Column(
                            children: [
                              Text('5', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 24, fontWeight: FontWeight.bold)),
                              Text('Weak Topics', style: TextStyle(color: Color(0xFFD1D5DB))),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 24),
              Text(
                'Recent Activity',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 12),
              Card(
                color: Color(0xFF374151),
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Mathematics Quiz', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          Text('Score: 88%', style: TextStyle(color: Color(0xFFD1D5DB))),
                          Text('2 hours ago', style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12)),
                        ],
                      ),
                      Icon(Icons.check_circle, color: Colors.green),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
