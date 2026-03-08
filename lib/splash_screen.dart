import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../config/app_theme.dart';

class AnimatedSplashScreen extends StatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  State<AnimatedSplashScreen> createState() => _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends State<AnimatedSplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    _controller.forward();

    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    // Wait for splash animation to play
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    try {
      debugPrint('[v0] Checking for existing authenticated session...');

      // Corrected: Use FirebaseAuth.instance directly
      final firebaseUser = auth.FirebaseAuth.instance.currentUser;

      if (!mounted) return;

      if (firebaseUser != null) {
        debugPrint('[v0] Firebase user found: ${firebaseUser.uid}');

        // Fetch the user's role from Firestore
        final userDoc = await FirebaseFirestore.instance
            .collection('users')
            .doc(firebaseUser.uid)
            .get();

        if (!mounted) return;

        if (userDoc.exists) {
          final appUser = AppUser.fromMap(userDoc.data()!);
          debugPrint(
              '[v0] User document found: ${appUser.email}, Role: ${appUser.role}');

          // Navigate to the appropriate dashboard based on the user's role
          String route;
          switch (appUser.role) {
            case UserRole.instructor:
              route = '/teacher_dashboard';
              break;
            case UserRole.student:
              route = '/student_dashboard';
              break;
            case UserRole.admin:
              route = '/admin/dashboard';
              break;
          }
          debugPrint('[v0] Navigating to: $route');
          Navigator.of(context).pushReplacementNamed(route);
        } else {
          debugPrint('[v0] User document not found in Firestore, navigating to login');
          Navigator.of(context).pushReplacementNamed('/login_portal');
        }
      } else {
        debugPrint('[v0] No existing session, navigating to login');
        Navigator.of(context).pushReplacementNamed('/login_portal');
      }
    } catch (e) {
      debugPrint('[v0] Error checking auth state: $e');
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login_portal');
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppTheme.deepBrown,
              AppTheme.warmBrown,
            ],
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.school,
                        size: 70,
                        color: AppTheme.primaryGold,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Test Hub',
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryGold,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 30),
                      SizedBox(
                        width: 30,
                        height: 30,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppTheme.primaryGold.withValues(alpha: 0.8),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
