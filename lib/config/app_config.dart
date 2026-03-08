class AppConfig {
  // Firebase Configuration
  static const bool useFirebase = true;
  static const bool enableFirebaseLogging = true;

  // Gemini AI Configuration
  static const String geminiApiKey = 'AIzaSyDCMszEQHsFp6iUAW8RMKgJn3yUL-NhAmE';
  static const String geminiModel = 'gemini-1.5-pro';

  // Quiz Generation Settings
  static const int defaultQuestionsPerQuiz = 10;
  static const int minQuestionsPerQuiz = 3;
  static const int maxQuestionsPerQuiz = 20;
  static const int defaultTimePerQuestion = 30; // seconds

  // Firebase Collections
  static const String quizzesCollection = 'quizzes';
  static const String resultsCollection = 'quiz_results';
  static const String usersCollection = 'users';
  static const String classesCollection = 'classes';

  // App Features
  static const bool enableAIQuizGeneration = true;
  static const bool enableDocumentAnalysis = true;
  static const bool enableLiveQuizMode = true;
  static const bool enableGhostMode = true;

  // PIN Configuration
  static const int pinLength = 6;
  static const int pinMinValue = 100000;
  static const int pinMaxValue = 999999;
}
