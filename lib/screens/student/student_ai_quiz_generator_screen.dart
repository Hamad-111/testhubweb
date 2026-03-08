import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_ai_service.dart';
import '../../services/file_service.dart';
import '../teacher/preview_generated_quiz_screen.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;

class StudentAIQuizGeneratorScreen extends StatefulWidget {
  const StudentAIQuizGeneratorScreen({super.key});

  @override
  State<StudentAIQuizGeneratorScreen> createState() => _StudentAIQuizGeneratorScreenState();
}

class _StudentAIQuizGeneratorScreenState extends State<StudentAIQuizGeneratorScreen>
    with SingleTickerProviderStateMixin {
  String? _selectedFilePath;
  String? _fileContent;
  String _quizTitle = '';
  String _selectedSubject = 'General Knowledge';
  int _numberOfQuestions = 100;
  String _questionType = 'multiple_choice';
  bool _isLoading = false;
  bool _isProcessing = false;
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
        String fileName = filePath.split('/').last;
        setState(() {
          _selectedFilePath = filePath;
          _fileContent = content;
          if (_quizTitle.isEmpty) {
            _quizTitle = 'Practice: ${fileName.split('.').first}';
          }
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('File loaded successfully! ✓'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateQuiz() async {
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

    if (_quizTitle.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a quiz title'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      late List<Question> generatedQuestions;

      if (_questionType == 'multiple_choice') {
        generatedQuestions = await _aiService.generateMultipleChoiceQuestions(
          content: _fileContent!,
          numberOfQuestions: _numberOfQuestions,
        );
      } else {
        generatedQuestions = await _aiService.generateTrueFalseQuestions(
          content: _fileContent!,
          numberOfQuestions: _numberOfQuestions,
        );
      }

      final quiz = Quiz(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: _quizTitle,
        description: 'AI Generated Practice Quiz',
        instructorId: auth.FirebaseAuth.instance.currentUser?.uid ?? '',
        questions: generatedQuestions,
        mode: QuizMode.selfPaced,
        isPublished: false,
        tags: ['student-practice', 'ai-generated'],
        createdAt: DateTime.now(),
        topic: _selectedSubject,
      );

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PreviewGeneratedQuizScreen(quiz: quiz),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error generating quiz: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF2196F3),
        title: const Text('AI Practice Quiz'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: FadeTransition(
          opacity: _fadeController,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Generate a practice quiz from your study material.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 25),

              // File Upload Section
              _buildSection(
                title: '📁 Upload Study Material',
                child: Column(
                  children: [
                    if (_selectedFilePath != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 15),
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: Colors.blue),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _selectedFilePath!.split('/').last,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.blue,
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
                        padding: const EdgeInsets.all(20),
                        margin: const EdgeInsets.only(bottom: 15),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                        ),
                        child: const Center(
                          child: Text(
                            'No file selected (PDF or TXT)',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      ),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _pickFile,
                        icon: const Icon(Icons.upload_file),
                        label: Text(_isLoading ? 'Loading...' : 'Select File'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2196F3),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Quiz Settings
              _buildSection(
                title: '⚙️ Quiz Settings',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: TextEditingController(text: _quizTitle)..selection = TextSelection.fromPosition(TextPosition(offset: _quizTitle.length)),
                      onChanged: (value) => _quizTitle = value,
                      decoration: InputDecoration(
                        labelText: 'Quiz Title',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 15),
                    TextField(
                      controller: TextEditingController(text: _selectedSubject)..selection = TextSelection.fromPosition(TextPosition(offset: _selectedSubject.length)),
                      onChanged: (value) => _selectedSubject = value,
                      decoration: InputDecoration(
                        labelText: 'Subject / Topic',
                        hintText: 'e.g. Quantum Physics, Algebra',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text('Questions: $_numberOfQuestions', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Slider(
                      value: _numberOfQuestions.toDouble(),
                      min: 5,
                      max: 100,
                      divisions: 19,
                      label: '$_numberOfQuestions',
                      activeColor: const Color(0xFF2196F3),
                      onChanged: (v) => setState(() => _numberOfQuestions = v.toInt()),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // Generate Button
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed: _isProcessing ? null : _generateQuiz,
                  icon: _isProcessing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.auto_awesome),
                  label: Text(_isProcessing ? 'Generating...' : 'Generate Practice Quiz'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4CAF50),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          child,
        ],
      ),
    );
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }
}
