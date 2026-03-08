import 'package:flutter/material.dart';
import '../../models/notes_model.dart';
import '../../services/firebase_note_service.dart';
import 'student_ai_notes_generator_screen.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;

class MyNotesScreen extends StatefulWidget {
  const MyNotesScreen({super.key});

  @override
  State<MyNotesScreen> createState() => _MyNotesScreenState();
}

class _MyNotesScreenState extends State<MyNotesScreen> {
  final FirebaseNoteService _noteService = FirebaseNoteService();

  @override
  Widget build(BuildContext context) {
    final user = auth.FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My AI Notes'),
        backgroundColor: const Color(0xFF1F2937),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const StudentAINotesGeneratorScreen()),
          );
        },
        backgroundColor: const Color(0xFF00BCD4),
        icon: const Icon(Icons.add_comment),
        label: const Text('New AI Note'),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1F2937), Color(0xFF111827)],
          ),
        ),
        child: user == null
            ? const Center(child: Text('Please login to view notes', style: TextStyle(color: Colors.white)))
            : StreamBuilder<List<Note>>(
                stream: _noteService.getStudentNotesStream(user.uid),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.white)));
                  }

                  final notes = snapshot.data ?? [];

                  if (notes.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.note_alt_outlined, size: 80, color: Colors.grey.withValues(alpha: 0.3)),
                          const SizedBox(height: 20),
                          const Text(
                            'No notes yet.\nClick "New AI Note" to generate one!',
                            style: TextStyle(color: Colors.grey, fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: notes.length,
                    itemBuilder: (context, index) {
                      final note = notes[index];
                      return _buildNoteCard(context, note);
                    },
                  );
                },
              ),
      ),
    );
  }

  Widget _buildNoteCard(BuildContext context, Note note) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: const Color(0xFF374151),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _viewNoteDetails(context, note),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      note.sourceFileName ?? 'Unnamed Note',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(Icons.auto_awesome, color: Color(0xFF00BCD4), size: 16),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                note.content,
                style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 13),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Generated on ${_formatDate(note.createdAt)}',
                    style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Color(0xFFF44336), size: 20),
                        onPressed: () => _confirmDelete(context, note),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _viewNoteDetails(BuildContext context, Note note) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1F2937),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(color: Colors.grey, borderRadius: BorderRadius.circular(2)),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(20),
                children: [
                  Row(
                    children: [
                      const Icon(Icons.description, color: Color(0xFF00BCD4)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          note.sourceFileName ?? 'Notes',
                          style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.grey, height: 30),
                  Text(
                    note.content,
                    style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.6),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, Note note) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF374151),
        title: const Text('Delete Note?', style: TextStyle(color: Colors.white)),
        content: const Text('This action cannot be undone.', style: TextStyle(color: Color(0xFFD1D5DB))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _noteService.deleteNote(note.id);
            },
            child: const Text('Delete', style: TextStyle(color: Color(0xFFF44336))),
          ),
        ],
      ),
    );
  }
}
