import 'package:flutter/material.dart';
import '../../services/firebase_ai_service.dart'; // Switched to Firebase AI service instead of direct Gemini
import '../../services/file_service.dart';
import '../../models/quiz_models.dart'; // Updated import to use quiz_models.dart (plural) instead of quiz_model.dart (singular)
import 'preview_generated_quiz_screen.dart';
// Import for QuizMode enum
// Import for AppConfig

class AIDocumentAnalysisScreen extends StatefulWidget {
  const AIDocumentAnalysisScreen({super.key});

  @override
  State<AIDocumentAnalysisScreen> createState() =>
      _AIDocumentAnalysisScreenState();
}

class _AIDocumentAnalysisScreenState extends State<AIDocumentAnalysisScreen>
    with SingleTickerProviderStateMixin {
  String? _selectedFilePath;
  String? _fileContent;
  String? _analysisResult;
  bool _isLoading = false;
  bool _isAnalyzing = false;
  late AnimationController _fadeController;
  late FirebaseAIService _aiService;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeController.forward();

    _aiService = FirebaseAIService();
  }

  Future<void> _pickFile() async {
    try {
      setState(() => _isLoading = true);
      final filePath = await FileService.pickFile();

      if (filePath != null) {
        final content = await FileService.getFileContent(filePath);
        setState(() {
          _selectedFilePath = filePath;
          _fileContent = content;
          _analysisResult = null;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('File loaded successfully! ✓'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _analyzeDocument() async {
    if (_fileContent == null || _fileContent!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a file first'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isAnalyzing = true);

    try {
      final analysis = await _aiService.analyzeDocument(_fileContent!);
      setState(() => _analysisResult = analysis);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Document analyzed successfully! ✓'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error analyzing document: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  Future<void> _generateQuizFromAnalysis() async {
    if (_fileContent == null) return;

    setState(() => _isAnalyzing = true);

    try {
      final questions =
      await _aiService.generateMultipleChoiceQuestions(
        content: _fileContent!,
        numberOfQuestions: 10,
      );

      if (mounted) {
        final quiz = Quiz(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          title: 'Generated Quiz from Document',
          description: _selectedFilePath?.split('/').last ?? 'Document',
          instructorId: '', // Will be set when publishing
          questions: questions,
          mode: QuizMode.live, // Changed from string 'live' to QuizMode.live enum
          isPublished: false,
          tags: ['document-generated'],
          createdAt: DateTime.now(),
        );

        Navigator.push(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                PreviewGeneratedQuizScreen(quiz: quiz),
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
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: FadeTransition(
        opacity: _fadeController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Upload & Analyze Documents',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Upload your essay or document to generate AI-powered quizzes',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 30),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5E7EB)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '📁 Upload Document',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 15),
                  if (_selectedFilePath != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _selectedFilePath!.split('/').last,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFFE5E7EB),
                        ),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            '📄',
                            style: TextStyle(fontSize: 48),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'No file selected',
                            style: TextStyle(
                              color: Color(0xFF6B7280),
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Supported: TXT, PDF, DOC, DOCX',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 15),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _pickFile,
                      icon: const Icon(Icons.upload_file),
                      label: Text(
                        _isLoading ? 'Loading...' : 'Choose Document',
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C4DFF),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 25),
            if (_selectedFilePath != null) ...[
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton.icon(
                    onPressed: _isAnalyzing ? null : _analyzeDocument,
                    icon: _isAnalyzing
                        ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                        AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                        : const Icon(Icons.auto_awesome),
                    label: Text(
                      _isAnalyzing ? 'Analyzing...' : 'Analyze Document',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2196F3),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _isAnalyzing ? null : _generateQuizFromAnalysis,
                    icon: _isAnalyzing
                        ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                        AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                        : const Icon(Icons.gamepad),
                    label: Text(
                      _isAnalyzing ? 'Generating...' : 'Create Quiz Game',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4CAF50),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 25),
            ],
            if (_analysisResult != null) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Document Analysis Results',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _analysisResult!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4B5563),
                        height: 1.6,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }
}
