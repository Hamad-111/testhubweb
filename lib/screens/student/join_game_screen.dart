import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
// Corrected import
import '../../services/firebase_quiz_service.dart';
import '../../widgets/animated_card.dart';
import 'play_screen.dart';
import '../../config/app_theme.dart'; // Import AppTheme

class JoinGameScreen extends StatefulWidget {
  final String? initialPin;
  const JoinGameScreen({super.key, this.initialPin});

  @override
  State<JoinGameScreen> createState() => _JoinGameScreenState();
}

class _JoinGameScreenState extends State<JoinGameScreen> {
  late TextEditingController _pinController;
  String _selectedAvatar = '👩‍🎓';
  bool _isLoading = false;
  final FirebaseQuizService _quizService = FirebaseQuizService();

  @override
  void initState() {
    super.initState();
    _pinController = TextEditingController(text: widget.initialPin);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightCream, // Corrected theme property
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            const AnimatedCardWidget(
              delay: Duration(milliseconds: 100),
              child: Text(
                'Join a Live Game',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.deepBrown, // Using theme color
                ),
              ),
            ),
            const SizedBox(height: 10),
            AnimatedCardWidget(
              delay: const Duration(milliseconds: 150),
              child: Text(
                'Enter the PIN from your teacher',
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.mediumBrown, // Using theme color
                ),
              ),
            ),
            const SizedBox(height: 40),
            const AnimatedCardWidget(
              delay: Duration(milliseconds: 200),
              child: Text(
                'Select Your Avatar',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.deepBrown, // Using theme color
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: ['👩‍🎓', '👨‍🎓', '👩‍💻', '👨‍💻']
                  .asMap()
                  .entries
                  .map((entry) {
                final index = entry.key;
                final avatar = entry.value;
                return AnimatedCardWidget(
                  delay: Duration(milliseconds: 250 + (index * 50)),
                  child: GestureDetector(
                    onTap: () =>
                        setState(() => _selectedAvatar = avatar),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        color: _selectedAvatar == avatar
                            ? AppTheme.accentGold
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: _selectedAvatar == avatar
                              ? AppTheme.primaryGold
                              : AppTheme.mediumBrown,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          avatar,
                          style: const TextStyle(fontSize: 36),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 40),
            const AnimatedCardWidget(
              delay: Duration(milliseconds: 450),
              child: Text(
                'Enter Game PIN',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.deepBrown,
                ),
              ),
            ),
            const SizedBox(height: 20),
            AnimatedCardWidget(
              delay: const Duration(milliseconds: 500),
              child: TextField(
                controller: _pinController,
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 6,
                enabled: !_isLoading,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 10,
                  color: AppTheme.deepBrown,
                ),
                decoration: InputDecoration(
                  hintText: '000000',
                  border: Theme.of(context).inputDecorationTheme.border,
                  enabledBorder: Theme.of(context).inputDecorationTheme.enabledBorder,
                  focusedBorder: Theme.of(context).inputDecorationTheme.focusedBorder,
                ),
              ),
            ),
            const SizedBox(height: 40),
            AnimatedCardWidget(
              delay: const Duration(milliseconds: 550),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: Theme.of(context).elevatedButtonTheme.style,
                  onPressed: _isLoading
                      ? null
                      : () async {
                    if (_pinController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Please enter a PIN'),
                          backgroundColor: Colors.red,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }

                    if (_pinController.text.length != 6) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('PIN must be 6 digits'),
                          backgroundColor: Colors.red,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }

                    setState(() => _isLoading = true);

                    try {
                      final quiz = await _quizService.getQuizByPin(
                        _pinController.text,
                      );

                      if (!mounted) return;

                      setState(() => _isLoading = false);

                      if (quiz != null) {
                        // Get current user info
                        final currentUser = auth.FirebaseAuth.instance.currentUser;
                        final studentName = currentUser?.displayName ?? currentUser?.email ?? 'Student';

                        Navigator.push(
                          context,
                          PageRouteBuilder(
                            pageBuilder: (context, animation,
                                secondaryAnimation) =>
                                PlayScreen(
                                  quiz: quiz,
                                  studentName: studentName,
                                  avatar: _selectedAvatar,
                                ),
                            transitionsBuilder: (context, animation,
                                secondaryAnimation, child) {
                              return SlideTransition(
                                position: animation.drive(
                                  Tween(
                                    begin: const Offset(1.0, 0.0),
                                    end: Offset.zero,
                                  ),
                                ),
                                child: child,
                              );
                            },
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context)
                            .showSnackBar(
                          const SnackBar(
                            content: Text('Invalid PIN - Quiz not found'),
                            backgroundColor: Colors.red,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    } catch (e) {
                      if (!mounted) return;
                      setState(() => _isLoading = false);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Error: ${e.toString()}'),
                          backgroundColor: Colors.red,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                  child: _isLoading
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.deepBrown),
                    ),
                  )
                      : const Text('Join Game'),
                ),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom + 20),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }
}
