import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseDiagnosticScreen extends StatefulWidget {
  const FirebaseDiagnosticScreen({super.key});

  @override
  State<FirebaseDiagnosticScreen> createState() => _FirebaseDiagnosticScreenState();
}

class _FirebaseDiagnosticScreenState extends State<FirebaseDiagnosticScreen> {
  final List<String> _logs = [];
  bool _isRunningTests = false;
  final Map<String, bool> _testResults = {};

  void _addLog(String message) {
    setState(() {
      _logs.add('${DateTime.now().toString().substring(11, 19)} - $message');
    });
    debugPrint('[Firebase Diagnostic] $message');
  }

  Future<void> _runDiagnostics() async {
    setState(() {
      _isRunningTests = true;
      _logs.clear();
      _testResults.clear();
    });

    _addLog('Starting Firebase diagnostics...');

    // Test 1: Firebase Initialization
    try {
      _addLog('Test 1: Checking Firebase initialization...');
      final app = auth.FirebaseAuth.instance.app;
      _addLog('✓ Firebase is initialized');
      _addLog('Project: ${app.options.projectId}');
      _testResults['initialization'] = true;
    } catch (e) {
      _addLog('✗ Firebase initialization failed: $e');
      _testResults['initialization'] = false;
    }

    // Test 2: Firestore Connection
    try {
      _addLog('Test 2: Testing Firestore connection...');
      await FirebaseFirestore.instance
          .collection('_test_connection')
          .doc('test')
          .set({'timestamp': FieldValue.serverTimestamp(), 'test': true});
      _addLog('✓ Firestore write successful');

      final doc = await FirebaseFirestore.instance
          .collection('_test_connection')
          .doc('test')
          .get();
      _addLog('✓ Firestore read successful');
      _addLog('Data: ${doc.data()}');
      _testResults['firestore'] = true;
    } catch (e) {
      _addLog('✗ Firestore connection failed: $e');
      _testResults['firestore'] = false;
    }

    // Test 3: Authentication Status
    try {
      _addLog('Test 3: Checking authentication status...');
      final currentUser = auth.FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        _addLog('✓ User is logged in');
        _addLog('Email: ${currentUser.email}');
        _addLog('UID: ${currentUser.uid}');
        _testResults['auth_status'] = true;
      } else {
        _addLog('ℹ No user currently logged in');
        _testResults['auth_status'] = true;
      }
    } catch (e) {
      _addLog('✗ Auth check failed: $e');
      _testResults['auth_status'] = false;
    }

    // Test 4: Check Users Collection
    try {
      _addLog('Test 4: Checking users collection...');
      final usersSnapshot = await FirebaseFirestore.instance
          .collection('users')
          .limit(5)
          .get();
      _addLog('✓ Users collection accessible');
      _addLog('Found ${usersSnapshot.docs.length} users');
      for (var doc in usersSnapshot.docs) {
        _addLog('  - ${doc.data()['name']} (${doc.data()['role']})');
      }
      _testResults['users_collection'] = true;
    } catch (e) {
      _addLog('✗ Users collection check failed: $e');
      _testResults['users_collection'] = false;
    }

    // Test 5: Real-time Listener
    try {
      _addLog('Test 5: Testing real-time listener...');
      final subscription = FirebaseFirestore.instance
          .collection('_test_connection')
          .doc('test')
          .snapshots()
          .listen((snapshot) {
        _addLog('✓ Real-time update received!');
        _addLog('Data: ${snapshot.data()}');
      });

      await Future.delayed(const Duration(seconds: 1));

      await FirebaseFirestore.instance
          .collection('_test_connection')
          .doc('test')
          .update({'lastUpdate': FieldValue.serverTimestamp()});

      await Future.delayed(const Duration(seconds: 2));
      subscription.cancel();
      _testResults['realtime'] = true;
    } catch (e) {
      _addLog('✗ Real-time listener failed: $e');
      _testResults['realtime'] = false;
    }

    _addLog('Diagnostics complete!');
    final passedTests = _testResults.values.where((v) => v).length;
    final totalTests = _testResults.length;
    _addLog('Results: $passedTests/$totalTests tests passed');

    setState(() {
      _isRunningTests = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Firebase Diagnostics'),
        backgroundColor: const Color(0xFF7C4DFF),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFF7C4DFF).withValues(alpha: 0.1),
            child: Column(
              children: [
                const Text(
                  'Firebase Real-Time Connection Test',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'This tool verifies your Firebase integration is working in real-time',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: _isRunningTests ? null : _runDiagnostics,
                  icon: _isRunningTests
                      ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                      : const Icon(Icons.play_arrow),
                  label: Text(_isRunningTests ? 'Running Tests...' : 'Run Diagnostics'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C4DFF),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  ),
                ),
              ],
            ),
          ),
          if (_testResults.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _testResults.entries.map((entry) {
                  return Chip(
                    label: Text(
                      entry.key.replaceAll('_', ' ').toUpperCase(),
                      style: const TextStyle(fontSize: 12),
                    ),
                    backgroundColor: entry.value
                        ? Colors.green.withValues(alpha: 0.2)
                        : Colors.red.withValues(alpha: 0.2),
                    avatar: Icon(
                      entry.value ? Icons.check_circle : Icons.error,
                      color: entry.value ? Colors.green : Colors.red,
                      size: 18,
                    ),
                  );
                }).toList(),
              ),
            ),
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(10),
              ),
              child: ListView.builder(
                itemCount: _logs.length,
                itemBuilder: (context, index) {
                  final log = _logs[index];
                  Color textColor = Colors.white70;
                  if (log.contains('✓')) textColor = Colors.greenAccent;
                  if (log.contains('✗')) textColor = Colors.redAccent;
                  if (log.contains('ℹ')) textColor = Colors.blueAccent;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      log,
                      style: TextStyle(
                        fontFamily: 'Courier',
                        fontSize: 12,
                        color: textColor,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

