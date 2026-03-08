import 'package:flutter/material.dart';

class ManageClassesScreen extends StatefulWidget {
  const ManageClassesScreen({super.key});

  @override
  State<ManageClassesScreen> createState() => _ManageClassesScreenState();
}

class _ManageClassesScreenState extends State<ManageClassesScreen> {
  final List<Map<String, dynamic>> classes = [
    {
      'name': 'Class A',
      'students': 35,
      'quizzes': 8,
      'code': 'CLSA2025',
    },
    {
      'name': 'Class B',
      'students': 32,
      'quizzes': 6,
      'code': 'CLSB2025',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Classes'),
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
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: classes.length,
          itemBuilder: (context, index) {
            final classItem = classes[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              color: const Color(0xFF374151),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          classItem['name'],
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        PopupMenuButton(
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              child: Text('Edit'),
                            ),
                            const PopupMenuItem(
                              child: Text('Delete'),
                            ),
                          ],
                          color: const Color(0xFF374151),
                          iconColor: Colors.white,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            Text(
                              '${classItem['students']}',
                              style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              'Students',
                              style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            Text(
                              '${classItem['quizzes']}',
                              style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              'Quizzes',
                              style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Code: ${classItem['code']}',
                      style: const TextStyle(color: Color(0xFFD1D5DB)),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add new class
        },
        backgroundColor: const Color(0xFF3B82F6),
        child: const Icon(Icons.add),
      ),
    );
  }
}
