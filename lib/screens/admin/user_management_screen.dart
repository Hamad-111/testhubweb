import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class UserManagementScreen extends StatefulWidget {
  final String? initialRole;
  const UserManagementScreen({super.key, this.initialRole});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  late String _selectedRole;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole ?? 'instructor';
  }

  Stream<QuerySnapshot> _getUsersStream() {
    return FirebaseFirestore.instance
        .collection('users')
        .where('role', isEqualTo: _selectedRole)
        .snapshots();
  }

  Future<void> _updateUserStatus(String userId, String currentStatus) async {
    final newStatus = currentStatus == 'active' ? 'suspended' : 'active';
    await FirebaseFirestore.instance.collection('users').doc(userId).update({
      'status': newStatus,
    });
  }

  Future<void> _deleteUser(String userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true), 
            child: const Text('Delete', style: TextStyle(color: Colors.red))
          ),
        ],
      ),
    );

    if (confirm == true) {
      await FirebaseFirestore.instance.collection('users').doc(userId).delete();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('User Management', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF46178F),
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'instructor', label: Text('Teachers'), icon: Icon(Icons.school)),
                    ButtonSegment(value: 'student', label: Text('Students'), icon: Icon(Icons.person)),
                  ],
                  selected: {_selectedRole},
                  onSelectionChanged: (Set<String> newSelection) {
                    setState(() {
                      _selectedRole = newSelection.first;
                    });
                  },
                  style: ButtonStyle(
                    backgroundColor: WidgetStateProperty.resolveWith<Color?>((states) {
                      if (states.contains(WidgetState.selected)) return const Color(0xFF46178F);
                      return null;
                    }),
                    foregroundColor: WidgetStateProperty.resolveWith<Color?>((states) {
                      if (states.contains(WidgetState.selected)) return Colors.white;
                      return null;
                    }),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by name or email...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
              ],
            ),
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _getUsersStream(),
              builder: (context, snapshot) {
                if (snapshot.hasError) return const Center(child: Text('Error loading users'));
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final users = snapshot.data!.docs.where((doc) {
                  final data = doc.data() as Map<String, dynamic>;
                  final name = (data['name'] ?? '').toString().toLowerCase();
                  final email = (data['email'] ?? '').toString().toLowerCase();
                  final search = _searchController.text.toLowerCase();
                  return name.contains(search) || email.contains(search);
                }).toList();

                if (users.isEmpty) {
                  return const Center(child: Text('No users found'));
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: users.length,
                  itemBuilder: (context, index) {
                    final userData = users[index].data() as Map<String, dynamic>;
                    final userId = users[index].id;
                    final status = userData['status'] ?? 'active';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _selectedRole == 'instructor' ? Colors.indigo[50] : Colors.green[50],
                          child: Text(
                            ((userData['name']?.toString() ?? '').isEmpty ? 'U' : userData['name'].toString()[0]).toUpperCase(),
                            style: TextStyle(
                              color: _selectedRole == 'instructor' ? Colors.indigo : Colors.green,
                              fontWeight: FontWeight.bold
                            ),
                          ),
                        ),
                        title: Text(
                          userData['name'] ?? 'Untitled', 
                          style: const TextStyle(fontWeight: FontWeight.bold)
                        ),
                        subtitle: Text(userData['email'] ?? 'No email'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: status == 'active' ? Colors.green[50] : Colors.red[50],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                status.toUpperCase(),
                                style: TextStyle(
                                  color: status == 'active' ? Colors.green : Colors.red,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold
                                ),
                              ),
                            ),
                            PopupMenuButton(
                              icon: const Icon(Icons.more_vert),
                              itemBuilder: (context) => [
                                PopupMenuItem(
                                  onTap: () => _updateUserStatus(userId, status),
                                  child: Text(status == 'active' ? 'Suspend' : 'Activate'),
                                ),
                                PopupMenuItem(
                                  onTap: () => _deleteUser(userId),
                                  child: const Text('Delete', style: TextStyle(color: Colors.red)),
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
          ),
        ],
      ),
    );
  }
}
