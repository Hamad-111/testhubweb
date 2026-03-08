import 'package:flutter/material.dart';
import '../../models/notes_model.dart';
import '../../services/firebase_ai_service.dart';
import '../../services/file_service.dart';
import '../../services/firebase_note_service.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;

class StudentAINotesGeneratorScreen extends StatefulWidget {
  const StudentAINotesGeneratorScreen({super.key});

  @override
  State<StudentAINotesGeneratorScreen> createState() => _StudentAINotesGeneratorScreenState();
}

class _StudentAINotesGeneratorScreenState extends State<StudentAINotesGeneratorScreen>
    with SingleTickerProviderStateMixin {
  String? _selectedFilePath;
  String? _fileContent;
  String _noteTitle = '';
  bool _isLoading = false;
  bool _isProcessing = false;
  String? _generatedSummary;
  late AnimationController _fadeController;
  late FirebaseAIService _aiService;
  late FirebaseNoteService _noteService;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeController.forward();
    _aiService = FirebaseAIService();
    _noteService = FirebaseNoteService();
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
          if (_noteTitle.isEmpty) {
            _noteTitle = fileName.split('.').first;
          }
          _generatedSummary = null;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateNotes() async {
    if (_fileContent == null) return;
    setState(() => _isProcessing = true);

    try {
      final summary = await _aiService.analyzeDocument(_fileContent!);
      setState(() => _generatedSummary = summary);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes generated successfully!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  Future<void> _saveNote() async {
    if (_generatedSummary == null) return;

    setState(() => _isLoading = true);
    try {
      final user = auth.FirebaseAuth.instance.currentUser;
      if (user == null) return;

      final note = Note(
        id: '', // Will be set by Firestore
        userId: user.uid,
        sourceFileName: _selectedFilePath?.split('/').last,
        content: _generatedSummary!,
        keyPoints: [], // Extract from summary if needed
        boldedTerms: [],
        createdAt: DateTime.now(),
        isPersonal: true,
        sharedWith: [],
      );

      await _noteService.saveNote(note);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes saved to your collection!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context); // Go back to dashboard/notes list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF00BCD4),
        title: const Text('AI Note Generator'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: FadeTransition(
          opacity: _fadeController,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection(
                title: '📁 Select Document',
                child: Column(
                  children: [
                    if (_selectedFilePath != null)
                      ListTile(
                        leading: const Icon(Icons.description, color: Color(0xFF00BCD4)),
                        title: Text(_selectedFilePath!.split('/').last),
                        trailing: IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () => setState(() => _selectedFilePath = null),
                        ),
                      )
                    else
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: _isLoading ? null : _pickFile,
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Pick PDF or Text File'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            side: const BorderSide(color: Color(0xFF00BCD4)),
                            foregroundColor: const Color(0xFF00BCD4),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              if (_selectedFilePath != null && _generatedSummary == null)
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: _isProcessing ? null : _generateNotes,
                    icon: _isProcessing
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.auto_awesome),
                    label: const Text('Generate AI Notes'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00BCD4),
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              if (_generatedSummary != null) ...[
                _buildSection(
                  title: '📝 Generated Notes: $_noteTitle',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Text(
                          _generatedSummary!,
                          style: const TextStyle(height: 1.5),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _saveNote,
                              icon: const Icon(Icons.save),
                              label: const Text('Save to My Notes'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4CAF50),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          IconButton(
                            onPressed: _generateNotes,
                            icon: const Icon(Icons.refresh, color: Color(0xFF00BCD4)),
                            tooltip: 'Regenerate',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
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
      margin: const EdgeInsets.only(bottom: 20),
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
