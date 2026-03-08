import 'package:flutter/material.dart';

class ImportQuizScreen extends StatefulWidget {
  const ImportQuizScreen({super.key});

  @override
  State<ImportQuizScreen> createState() => _ImportQuizScreenState();
}

class _ImportQuizScreenState extends State<ImportQuizScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Import Quiz'),
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
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Icon(Icons.file_upload, size: 64, color: Color(0xFF3B82F6)),
                const SizedBox(height: 20),
                const Text(
                  'Import Quiz from File',
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Upload a CSV or Excel file containing quiz questions',
                  style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF3B82F6), width: 2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        // File picker logic
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('File picker would open here')),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          children: [
                            const Icon(Icons.cloud_upload, size: 48, color: Color(0xFF3B82F6)),
                            const SizedBox(height: 16),
                            const Text(
                              'Tap to select file',
                              style: TextStyle(color: Colors.white, fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'or drag and drop',
                              style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                ElevatedButton(
                  onPressed: () {
                    // Import logic
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                    minimumSize: const Size(double.infinity, 50),
                  ),
                  child: const Text('Import Quiz'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
