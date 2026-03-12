import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../models/notes_model.dart';
import '../../services/firebase_ai_service.dart';
import '../../services/file_service.dart';
import '../../services/firebase_note_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class StudentAINotesGeneratorScreen extends StatefulWidget {
  const StudentAINotesGeneratorScreen({super.key});

  @override
  State<StudentAINotesGeneratorScreen> createState() => _StudentAINotesGeneratorScreenState();
}

class _StudentAINotesGeneratorScreenState extends State<StudentAINotesGeneratorScreen>
    with SingleTickerProviderStateMixin {
  String _selectedNoteType = 'summary';
  String? _selectedFilePath;
  String? _fileContent;
  String _noteTitle = '';
  bool _isLoading = false;
  bool _isProcessing = false;
  String? _generatedSummary;
  late AnimationController _fadeController;
  late FirebaseAIService _aiService;
  late FirebaseNoteService _noteService;
  AppUser? _currentUser;

  final List<Map<String, String>> _noteTypes = [
    {'id': 'summary', 'label': 'Summary', 'icon': '📝'},
    {'id': 'detailed', 'label': 'Detailed', 'icon': '📚'},
    {'id': 'keyPoints', 'label': 'Key Points', 'icon': '💡'},
    {'id': 'qa', 'label': 'Q&A Style', 'icon': '❓'},
  ];

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
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading user: $e');
    }
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
    
    // Check if user is loaded
    if (_currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('User profile not loaded yet. Please try again.'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);

    try {
      // Notes limit check for free tier
      if (_currentUser!.subscriptionStatus != 'active') {
        final notesSnapshot = await FirebaseFirestore.instance
            .collection('notes')
            .where('userId', isEqualTo: _currentUser!.id)
            .count()
            .get();
        
        final notesCount = notesSnapshot.count ?? 0;

        if (notesCount >= 3) {
          if (mounted) {
            setState(() => _isProcessing = false);
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('💎 Premium Feature'),
                content: const Text(
                  'You have reached the limit of 3 free AI generated notes.\n\nPlease upgrade your plan on the Web Portal to generate unlimited notes.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
            );
          }
          return;
        }
      }

      final summary = await _aiService.analyzeDocument(_fileContent!, noteType: _selectedNoteType);
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

  Future<void> _downloadNotes() async {
    if (_generatedSummary == null) return;
    try {
      final pdf = pw.Document();
      pdf.addPage(
        pw.Page(
          build: (pw.Context context) => pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(_noteTitle, style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 10),
              pw.Text('Source: ${_selectedFilePath?.split('/').last ?? "Unknown"}'),
              pw.Text('Type: $_selectedNoteType'),
              pw.Divider(),
              pw.SizedBox(height: 20),
              pw.Text(_generatedSummary!),
            ],
          ),
        ),
      );

      await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdf.save());
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Download failed: $e'), backgroundColor: Colors.red),
      );
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
        keyPoints: [], 
        boldedTerms: [],
        createdAt: DateTime.now(),
        isPersonal: true,
        noteType: _selectedNoteType,
        sharedWith: [],
      );

      await _noteService.saveNote(note);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes saved to your library!'), backgroundColor: Colors.green),
        );
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
              _buildSection(
                title: '📋 Choose Note Type',
                child: Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: _noteTypes.map((type) {
                    final isSelected = _selectedNoteType == type['id'];
                    return InkWell(
                      onTap: () => setState(() => _selectedNoteType = type['id']!),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF00BCD4) : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF00BCD4) : Colors.grey.shade300,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(type['icon']!, style: const TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Text(
                              type['label']!,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.black87,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
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
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
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
                        width: double.infinity,
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
                              label: const Text('Save'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4CAF50),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _downloadNotes,
                              icon: const Icon(Icons.download),
                              label: const Text('Download'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blueAccent,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
