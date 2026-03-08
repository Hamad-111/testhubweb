import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import '../../models/quiz_models.dart';
import '../../models/user_model.dart';
import '../../services/firebase_ai_service.dart';
import '../../services/file_service.dart';
import 'preview_generated_quiz_screen.dart';
// Added app config import

class AIQuizGeneratorScreen extends StatefulWidget {
  const AIQuizGeneratorScreen({super.key});

  @override
  State<AIQuizGeneratorScreen> createState() => _AIQuizGeneratorScreenState();
}

class _AIQuizGeneratorScreenState extends State<AIQuizGeneratorScreen>
    with SingleTickerProviderStateMixin {
  String? _selectedFilePath;
  String? _fileContent;
  String _quizTitle = '';
  String _quizDescription = '';
  String _selectedSubject = 'General Knowledge';
  int _numberOfQuestions = 100;
  String _questionType = 'multiple_choice'; // multiple_choice or true_false
  bool _isLoading = false;
  bool _isProcessing = false;
  late AnimationController _fadeController;
  late FirebaseAIService _aiService;

  @override
  AppUser? _currentUser;
  bool _isLoadingUser = true;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeController.forward();

    _aiService = FirebaseAIService();
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
          if (mounted) {
            setState(() {
              _currentUser = AppUser.fromMap(userDoc.data()!);
              _isLoadingUser = false;
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading user: $e');
      if (mounted) setState(() => _isLoadingUser = false);
    }
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
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('File loaded successfully! ✓'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
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
    // Subscription Check
    if (_currentUser?.subscriptionStatus != 'active') {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('💎 Premium Feature'),
          content: const Text(
            'AI Quiz Generation is a premium feature.\n\nPlease upgrade your plan on the Web Portal to access this feature.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }

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
        description: _quizDescription,
        instructorId: '', // Will be set when publishing
        questions: generatedQuestions,
        mode: QuizMode.live, // Changed from string 'live' to QuizMode.live enum
        isPublished: false,
        tags: ['ai-generated'],
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
        backgroundColor: const Color(0xFF7C4DFF),
        title: const Text('AI Quiz Generator'),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: FadeTransition(
          opacity: _fadeController,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // File Upload Section
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
                      '📁 Upload Your File',
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
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: const Color(0xFFE5E7EB),
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            'No file selected',
                            style: TextStyle(
                              color: Color(0xFF6B7280),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 15),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _pickFile,
                        icon: const Icon(Icons.upload_file),
                        label: Text(
                          _isLoading ? 'Loading...' : 'Choose File',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF7C4DFF),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 25),

              // Quiz Details Section
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
                      'Quiz Details',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 15),
                    TextField(
                      onChanged: (value) => setState(() => _quizTitle = value),
                      decoration: InputDecoration(
                        labelText: 'Quiz Title',
                        hintText: 'Enter quiz title',
                        prefixIcon: const Icon(Icons.title),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFF7C4DFF),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                    TextField(
                      onChanged: (value) =>
                          setState(() => _quizDescription = value),
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Description',
                        hintText: 'Enter quiz description',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFF7C4DFF),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 25),

              // Question Settings Section
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
                      'Question Settings',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 15),
                    // Subject Selection
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Subject',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          onChanged: (value) => setState(() => _selectedSubject = value),
                          decoration: InputDecoration(
                            hintText: 'e.g. History, Mathematics',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    // Question Type Selection
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Question Type',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(
                                        () => _questionType = 'multiple_choice'),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: _questionType == 'multiple_choice'
                                        ? const Color(0xFF7C4DFF)
                                        : Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _questionType == 'multiple_choice'
                                          ? const Color(0xFF7C4DFF)
                                          : const Color(0xFFE5E7EB),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Multiple Choice',
                                      style: TextStyle(
                                        color: _questionType ==
                                            'multiple_choice'
                                            ? Colors.white
                                            : Colors.black,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: GestureDetector(
                                onTap: () =>
                                    setState(() => _questionType = 'true_false'),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: _questionType == 'true_false'
                                        ? const Color(0xFF7C4DFF)
                                        : Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _questionType == 'true_false'
                                          ? const Color(0xFF7C4DFF)
                                          : const Color(0xFFE5E7EB),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'True/False',
                                      style: TextStyle(
                                        color: _questionType == 'true_false'
                                            ? Colors.white
                                            : Colors.black,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),
                    // Number of Questions
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Number of Questions',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1F2937),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF7C4DFF)
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '$_numberOfQuestions',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF7C4DFF),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Slider(
                          value: _numberOfQuestions.toDouble(),
                          min: 3,
                          max: 100,
                          divisions: 97,
                          label: '$_numberOfQuestions',
                          activeColor: const Color(0xFF7C4DFF),
                          inactiveColor:
                          const Color(0xFFE5E7EB),
                          onChanged: (value) {
                            setState(
                                    () => _numberOfQuestions = value.toInt());
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // Generate Button
              Container(
                width: double.infinity,
                height: 55,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF7C4DFF).withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: _isProcessing ? null : _generateQuiz,
                  icon: _isProcessing
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      valueColor:
                      AlwaysStoppedAnimation<Color>(Colors.white),
                      strokeWidth: 2,
                    ),
                  )
                      : const Icon(Icons.auto_awesome),
                  label: Text(
                    _isProcessing
                        ? 'Generating Quiz...'
                        : 'Generate Quiz with AI',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C4DFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 5,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
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
