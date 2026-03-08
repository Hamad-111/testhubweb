import 'package:flutter/material.dart';
import 'package:testhub2/student_login_screen.dart';
import 'package:testhub2/teacher_login_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Hub Login'),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const StudentLoginScreen()),
                );
              },
              child: const Text('I am a Student'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const TeacherLoginScreen()),
                );
              },
              child: const Text('I am a Teacher'),
            ),
          ],
        ),
      ),
    );
  }
}
