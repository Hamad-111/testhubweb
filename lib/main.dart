import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart'; // Added Firebase imports
// Added Firebase App Check import
import 'services/quiz_service.dart';
import 'animated_splash_screen.dart';
import 'login_portal_screen.dart';
import 'teacher_login_screen.dart';
import 'student_login_screen.dart';
import 'screens/teacher/teacher_dashboard.dart';
import 'screens/student/student_dashboard.dart';
import 'screens/student/schedule/classes_screen.dart';
import 'screens/student/schedule/subjects_screen.dart';
import 'screens/student/schedule/exams_schedule_screen.dart';
import 'screens/teacher/create_quiz_screen.dart';
import 'screens/teacher/add_questions_screen.dart';
import 'screens/teacher/ai_document_analysis_screen.dart';
import 'screens/teacher/ai_quiz_generator_screen.dart';
import 'screens/teacher/my_quizzes_screen.dart';
import 'screens/teacher/class_reports_screen.dart';
import 'screens/teacher/teacher_reports_screen.dart'; // Added teacher reports screen import
import 'screens/teacher/manage_classes_screen.dart';
import 'screens/teacher/import_quiz_screen.dart';
import 'screens/student/join_game_screen.dart';
// Updated import to use alias
import 'screens/student/my_progress_screen.dart';
import 'screens/student/weak_topics_screen.dart';
import 'screens/student/my_notes_screen.dart';
import 'screens/student/practice_quiz_screen.dart';
import 'screens/student/ghost_mode_screen.dart';
import 'screens/admin/admin_dashboard.dart';
import 'screens/admin/user_management_screen.dart';
import 'screens/admin/analytics_screen.dart';
import 'screens/admin/approve_instructors_screen.dart';
import 'teacher_signup_screen.dart';
import 'student_signup_screen.dart';
import 'firebase_diagnostic_screen.dart'; // Added Firebase diagnostic screen import
import 'temp_admin_login.dart'; // Added temporary admin login screen import
// Added Quiz model import
// Added QuizResult model import
import 'config/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(); // Modified main to initialize Firebase

  debugPrint('[v0] ✅ Firebase Core initialized successfully');
  debugPrint('[v0] 🚀 Using Gemini Developer API (no App Check required)');
  debugPrint('[v0] 📘 Get your API key at: https://aistudio.google.com/apikey');

  runApp(const TestHubApp());
}

class TestHubApp extends StatelessWidget {
  const TestHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => QuizService()),
      ],
      child: MaterialApp(
        title: 'Test Hub',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: {
          '/': (context) => const AnimatedSplashScreen(),
          '/login_portal': (context) => const LoginPortalScreen(),
          '/teacher_login': (context) => const TeacherLoginScreen(),
          '/student_login': (context) => const StudentLoginScreen(),
          '/teacher_signup': (context) => const TeacherSignupScreen(),
          '/student_signup': (context) => const StudentSignupScreen(),
          '/firebase_diagnostic': (context) => const FirebaseDiagnosticScreen(), // Added Firebase diagnostic route
          '/temp_admin': (context) => const TempAdminLogin(), // Added temporary admin access route for testing
          '/teacher_dashboard': (context) => const TeacherDashboard(),
          '/student_dashboard': (context) => const StudentDashboard(),
          '/classes': (context) => const ClassesScreen(),
          '/subjects': (context) => const SubjectsScreen(),
          '/exams': (context) => const ExamsScheduleScreen(),

          // Teacher Portal Routes (SRS Feature 2, 3, 7)
          '/teacher/create_quiz': (context) => const CreateQuizScreen(),
          '/teacher/add_questions': (context) => AddQuestionsScreen(
            title: 'Add Questions',
            description: '',
            subject: '',
            timePerQuestion: 30,
            questionLimit: 10, // Default limit for direct route access
          ),
          '/teacher/ai_analyze': (context) => AIDocumentAnalysisScreen(), // Removed const keyword
          '/teacher/quiz_generator': (context) => AIQuizGeneratorScreen(), // Removed const keyword
          '/teacher/my_quizzes': (context) => const MyQuizzesScreen(),
          '/teacher/class_reports': (context) => const ClassReportsScreen(),
          '/teacher/reports': (context) => const TeacherReportsScreen(), // Added route for teacher quiz reports screen
          '/teacher/manage_classes': (context) => const ManageClassesScreen(),
          '/teacher/import_quiz': (context) => const ImportQuizScreen(),

          // Student Portal Routes (SRS Feature 4, 5, 6)
          '/student/join_game': (context) => const JoinGameScreen(),
          '/student/my_progress': (context) => const MyProgressScreen(),
          '/student/weak_topics': (context) => WeakTopicsScreen(), // Removed const keyword
          '/student/my_notes': (context) => const MyNotesScreen(),
          '/student/practice_quiz': (context) => const PracticeQuizScreen(),
          '/student/ghost_mode': (context) => const GhostModeScreen(),

          // Admin Routes (SRS Feature 7)
          '/admin/dashboard': (context) => const AdminDashboard(),
          '/admin/user_management': (context) => const UserManagementScreen(),
          '/admin/analytics': (context) => const AnalyticsScreen(),
          '/admin/approve_instructors': (context) => const ApproveInstructorsScreen(),
        },
      ),
    );
  }
}
