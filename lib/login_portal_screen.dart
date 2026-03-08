import 'package:flutter/material.dart';
import 'teacher_login_screen.dart';
import 'student_login_screen.dart';
import 'services/firebase_auth_service.dart';
import 'models/user_model.dart';

class LoginPortalScreen extends StatefulWidget {
  const LoginPortalScreen({super.key});

  @override
  State<LoginPortalScreen> createState() => _LoginPortalScreenState();
}

class _LoginPortalScreenState extends State<LoginPortalScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _rememberMe = false;
  String? _errorMessage;
  final FirebaseAuthService _authService = FirebaseAuthService();

  // Premium Professional Palette
  static const Color primaryPurple = Color(0xFF6D28D9); // Professional Deep Purple
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color bgPurpleDeep = Color(0xFF7C4DFF); // Original Purple
  static const Color bgPurpleLight = Color(0xFF6A1B9A);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final isStudent = _tabController.index == 0;

    if (email.isEmpty || password.isEmpty) {
      _showError('Please enter both email and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await _authService.signInWithEmail(email: email, password: password);
      if (user != null) {
        final isStudent = _tabController.index == 0;
        if (isStudent && user.role != UserRole.student) {
          throw 'This is not a student account. Please switch tabs.';
        } else if (!isStudent && user.role != UserRole.instructor && user.role != UserRole.admin) {
          throw 'This is not a teacher account. Please switch tabs.';
        }
        if (mounted) {
          final route = user.role == UserRole.admin 
            ? '/admin/dashboard' 
            : (user.role == UserRole.instructor ? '/teacher_dashboard' : '/student_dashboard');
          Navigator.pushNamedAndRemoveUntil(context, route, (route) => false);
        }
      }
    } catch (e) {
      if (mounted) _showError(e);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(dynamic error) {
    String message = error.toString().replaceAll('Exception: ', '');
    
    // Clean Firebase raw codes
    if (message.contains('invalid-credential')) {
      message = 'Invalid email or password. Please try again.';
    } else if (message.contains('user-not-found')) {
      message = 'No account found with this email.';
    } else if (message.contains('wrong-password')) {
      message = 'Incorrect password. Please try again.';
    } else if (message.contains('network-request-failed')) {
      message = 'Network error. Please check your connection.';
    } else if (message.contains('email-already-in-use')) {
      message = 'This email is already registered.';
    } else if (message.contains('] ')) {
      message = message.split('] ').last;
    }

    setState(() => _errorMessage = message);
    
    // Auto-hide after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted && _errorMessage == message) {
        setState(() => _errorMessage = null);
      }
    });
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final user = await _authService.signInWithGoogle();
      if (user != null && mounted) {
        final route = user.role == UserRole.admin 
          ? '/admin/dashboard' 
          : (user.role == UserRole.instructor ? '/teacher_dashboard' : '/student_dashboard');
        Navigator.pushNamedAndRemoveUntil(context, route, (route) => false);
      }
    } catch (e) {
      if (mounted) _showError(e);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPurpleDeep,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [bgPurpleDeep, bgPurpleLight],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              const SizedBox(height: 25),
              // Unified Header Section
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 15,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Center(child: Text('🎓', style: TextStyle(fontSize: 65))),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Test Hub',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              // Premium Integrated Card
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(48),
                      topRight: Radius.circular(48),
                    ),
                    boxShadow: [
                      BoxShadow(color: Colors.black26, blurRadius: 20, offset: Offset(0, -5)),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(48),
                      topRight: Radius.circular(48),
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(30, 35, 30, 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Tab Bar Overhaul
                          Container(
                            decoration: const BoxDecoration(
                              border: Border(bottom: BorderSide(color: slate100, width: 2)),
                            ),
                            child: TabBar(
                              controller: _tabController,
                              labelColor: primaryPurple,
                              unselectedLabelColor: slate400,
                              indicatorColor: primaryPurple,
                              indicatorWeight: 4,
                              indicatorSize: TabBarIndicatorSize.label,
                              labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
                              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 17),
                              tabs: const [
                                Tab(text: 'Student'),
                                Tab(text: 'Teacher'),
                              ],
                            ),
                          ),
                          
                          if (_errorMessage != null) ...[
                            const SizedBox(height: 20),
                            _buildErrorBanner(),
                          ],
                          
                          const SizedBox(height: 35),
                          
                          // Form Sections (Slate Typography)
                          _buildLabel('Email Address'),
                          const SizedBox(height: 8),
                          _buildTextField(
                            controller: _emailController,
                            icon: Icons.email_outlined,
                            hint: 'yourname@email.com',
                          ),
                          
                          const SizedBox(height: 25),
                          
                          _buildLabel('Password'),
                          const SizedBox(height: 8),
                          _buildTextField(
                            controller: _passwordController,
                            icon: Icons.lock_outline,
                            hint: '••••••••••••',
                            obscure: _obscurePassword,
                            suffix: IconButton(
                              icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: primaryPurple, size: 20),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Pro Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: Checkbox(
                                      value: _rememberMe,
                                      onChanged: (v) => setState(() => _rememberMe = v ?? false),
                                      activeColor: primaryPurple,
                                      side: const BorderSide(color: slate200, width: 2),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  const Text('Remember me', style: TextStyle(color: slate600, fontSize: 14, fontWeight: FontWeight.w500)),
                                ],
                              ),
                              GestureDetector(
                                onTap: () {/* Reset Pwd logic */},
                                child: const Text('Forgot password?', style: TextStyle(color: primaryPurple, fontWeight: FontWeight.w700, fontSize: 14)),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 35),
                          
                          // Primary Pro Button
                          SizedBox(
                            width: double.infinity,
                            height: 60,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleLogin,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: primaryPurple,
                                foregroundColor: Colors.white,
                                elevation: 4,
                                shadowColor: primaryPurple.withOpacity(0.4),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: _isLoading
                                  ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                  : const Text('Login', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                            ),
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Subdued Divider
                          Row(
                            children: [
                              Expanded(child: Divider(color: slate100, thickness: 1.5)),
                              const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('Or', style: TextStyle(color: slate400, fontWeight: FontWeight.w600))),
                              Expanded(child: Divider(color: slate100, thickness: 1.5)),
                            ],
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Premium Social Row
                          _SocialBtn(
                            icon: Icons.g_mobiledata,
                            label: 'Continue with Google',
                            color: slate100,
                            textColor: slate800,
                            isBorder: true,
                            onPressed: _isLoading ? null : _handleGoogleSignIn,
                          ),
                          
                          const SizedBox(height: 35),
                          
                          // Final Footer
                          Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text("Don't have an account? ", style: TextStyle(color: slate600, fontSize: 15)),
                                GestureDetector(
                                  onTap: () => Navigator.pushNamed(context, _tabController.index == 0 ? '/student_signup' : '/teacher_signup'),
                                  child: const Text('Sign up', style: TextStyle(color: primaryPurple, fontWeight: FontWeight.w800, fontSize: 15)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFCA5A5).withOpacity(0.5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(
                color: Color(0xFF991B1B),
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, color: Color(0xFFEF4444), size: 18),
            onPressed: () => setState(() => _errorMessage = null),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: const TextStyle(fontWeight: FontWeight.w700, color: slate800, fontSize: 15));
  }

  Widget _buildTextField({required TextEditingController controller, required IconData icon, required String hint, bool obscure = false, Widget? suffix}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: const TextStyle(color: slate800, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: primaryPurple, size: 22),
        suffixIcon: suffix,
        hintText: hint,
        hintStyle: const TextStyle(color: slate400, fontSize: 15),
        filled: true,
        fillColor: slate100.withOpacity(0.5),
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: primaryPurple, width: 2)),
      ),
    );
  }
}

class _SocialBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color textColor;
  final bool isBorder;
  final VoidCallback? onPressed;

  const _SocialBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.textColor,
    this.isBorder = false,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: textColor,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: isBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
