import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../models/notes_model.dart';

class FirebaseNoteService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<String> saveNote(Note note) async {
    try {
      final noteData = note.toMap();
      noteData['createdAt'] = FieldValue.serverTimestamp();
      
      final docRef = await _firestore.collection('notes').add(noteData);
      debugPrint('[v0] Note saved successfully with ID: ${docRef.id}');
      
      // Update the ID in the document itself
      await docRef.update({'id': docRef.id});
      
      return docRef.id;
    } catch (e) {
      debugPrint('[v0] Store note error: $e');
      rethrow;
    }
  }

  Stream<List<Note>> getStudentNotesStream(String userId) {
    return _firestore
        .collection('notes')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
      final notes = snapshot.docs.map((doc) {
        try {
          // Flatten server timestamp to ISO string if necessary for fromMap
          final data = doc.data();
          if (data['createdAt'] is Timestamp) {
            data['createdAt'] = (data['createdAt'] as Timestamp).toDate().toIso8601String();
          }
          if (data['lastModified'] is Timestamp) {
            data['lastModified'] = (data['lastModified'] as Timestamp).toDate().toIso8601String();
          }
          return Note.fromMap(data);
        } catch (e) {
          debugPrint('[v0] Error parsing note: $e');
          return null;
        }
      }).whereType<Note>().toList();

      // Sort in memory by createdAt descending
      notes.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      return notes;
    });
  }

  Future<void> deleteNote(String noteId) async {
    try {
      await _firestore.collection('notes').doc(noteId).delete();
      debugPrint('[v0] Note deleted successfully');
    } catch (e) {
      debugPrint('[v0] Delete note error: $e');
      rethrow;
    }
  }

  Future<void> updateNote(String noteId, Map<String, dynamic> updates) async {
    try {
      updates['lastModified'] = FieldValue.serverTimestamp();
      await _firestore.collection('notes').doc(noteId).update(updates);
      debugPrint('[v0] Note updated successfully');
    } catch (e) {
      debugPrint('[v0] Update note error: $e');
      rethrow;
    }
  }
}
