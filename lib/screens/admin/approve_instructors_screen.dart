import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';

class ApproveInstructorsScreen extends StatefulWidget {
  const ApproveInstructorsScreen({super.key});

  @override
  State<ApproveInstructorsScreen> createState() => _ApproveInstructorsScreenState();
}

class _ApproveInstructorsScreenState extends State<ApproveInstructorsScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<List<AppUser>> _getPendingInstructors() {
    return _firestore
        .collection('users')
        .where('role', isEqualTo: 'instructor')
        .where('status', isEqualTo: 'pending')
        .snapshots()
        .map((snapshot) => snapshot.docs
        .map((doc) => AppUser.fromMap(doc.data()))
        .toList());
  }

  Future<void> _approveInstructor(String userId) async {
    try {
      await _firestore.collection('users').doc(userId).update({
        'status': 'active',
        'approvedAt': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Instructor approved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error approving instructor: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _rejectInstructor(String userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Instructor?'),
        content: const Text('This will permanently remove the instructor request.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true), 
            child: const Text('Reject', style: TextStyle(color: Colors.red))
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _firestore.collection('users').doc(userId).delete();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Instructor request rejected'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error rejecting instructor: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('Approve Instructors', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF46178F),
        elevation: 0,
      ),
      body: StreamBuilder<List<AppUser>>(
        stream: _getPendingInstructors(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF46178F)));
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final pending = snapshot.data ?? [];

          if (pending.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.green[50],
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.verified_user, size: 64, color: Colors.green),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'All Caught Up!',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const Text(
                    'No pending instructor requests found.',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: pending.length,
            itemBuilder: (context, index) {
              final instructor = pending[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: Colors.indigo[50],
                            child: Text(
                              instructor.name[0].toUpperCase(),
                              style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.w900, fontSize: 20),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  instructor.name,
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                                ),
                                Text(
                                  instructor.email,
                                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (instructor.institution != null) ...[
                        Text(
                          'Institution',
                          style: TextStyle(color: Colors.grey[400], fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          instructor.institution!,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                        ),
                      ],
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => _approveInstructor(instructor.id),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF46178F),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                              child: const Text('Approve', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => _rejectInstructor(instructor.id),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: BorderSide(color: Colors.red.withOpacity(0.2)),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
