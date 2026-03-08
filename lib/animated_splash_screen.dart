import 'package:flutter/material.dart';
import '../services/firebase_auth_service.dart';
import '../models/user_model.dart';

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

  final FirebaseAuthService _authService = FirebaseAuthService();

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

      // Check if user is already authenticated
      final appUser = await _authService.checkAuthState();

      if (!mounted) return;

      if (appUser != null) {
        debugPrint('[v0] User already authenticated: ${appUser.email}, Role: ${appUser.role}');

        // Navigate to appropriate dashboard based on role
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
          default:
            route = '/login_portal';
        }

        debugPrint('[v0] Navigating to: $route');
        Navigator.of(context).pushReplacementNamed(route);
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
              Color(0xFF6B2FB5), // Deep purple
              Color(0xFF5E72E4), // Blue purple
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
                      // Graduation cap icon
                      const Icon(
                        Icons.school,
                        size: 70,
                        color: Colors.white,
                      ),
                      const SizedBox(height: 16),

                      // Test Hub title
                      const Text(
                        'Test Hub',
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Loading indicator while checking auth
                      SizedBox(
                        width: 30,
                        height: 30,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white.withValues(alpha: 0.8),
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
