import 'package:flutter/material.dart';

class AppTheme {
  // Premium Golden & Brown Color Palette
  static const Color primaryGold = Color(0xFFD4AF37); // Rich gold
  static const Color primaryColor = Color(0xFFD4AF37); // Alias for primaryGold
  static const Color secondaryColor = Color(0xFF795548); // Warm brown
  static const Color accentGold = Color(0xFFF4E4C1); // Light golden cream
  static const Color deepBrown = Color(0xFF3E2723); // Dark chocolate brown
  static const Color mediumBrown = Color(0xFF5D4037); // Medium brown
  static const Color warmBrown = Color(0xFF795548); // Warm brown
  static const Color lightCream = Color(0xFFFFF8E1); // Light cream
  static const Color white = Color(0xFFFFFFFF);
  static const Color shadow = Color(0x40000000); // Soft shadow

  // Drawer colors
  static const Color drawerTextColor = Color(0xFF3E2723);
  static const Color drawerSubTextColor = Color(0xFF5D4037);
  static const Color drawerIconColor = Color(0xFFD4AF37);
  static const Color drawerSelectedTileColor = Color(0xFFFFF8E1);

  // Button colors
  static const Color buttonIconColor = Color(0xFF3E2723);
  static const Color buttonTextColor = Color(0xFF3E2723);
  static const Color buttonBackgroundColor = Color(0xFFD4AF37);

  // Dashboard colors
  static const Color dashboardWelcomeTextColor = Color(0xFF3E2723);
  static const Color avgScoreColor = Color(0xFF4CAF50);
  static const Color weakTopicsColor = Color(0xFFFF9800);
  static const Color myRankColor = Color(0xFF2196F3);

  // Join Game colors
  static const Color joinGamePrimaryColor = Color(0xFFD4AF37);
  static const Color joinGameSecondaryColor = Color(0xFF795548);
  static const Color joinGameShadowColor = Color(0xFFD4AF37);

  // Recent Results colors
  static const Color recentResultsTextColor = Color(0xFF3E2723);
  static const Color recentResultsBorderColor = Color(0xFFE0E0E0);
  static const Color recentResultsShadowColor = Color(0xFFD4AF37);
  static const Color recentResultsTitleColor = Color(0xFF3E2723);
  static const Color recentResultsSubTextColor = Color(0xFF5D4037);
  static const Color recentResultsHighScoreColor = Color(0xFF4CAF50);
  static const Color recentResultsLowScoreColor = Color(0xFFF44336);
  static const Color recentResultsRankColor = Color(0xFFD4AF37);

  // Stat Card colors
  static const Color statCardSubTextColor = Color(0xFF5D4037);

  // Leaderboard colors
  static const Color leaderboardTitleColor = Color(0xFF3E2723);
  static const Color leaderboardSubTextColor = Color(0xFF5D4037);
  static const Color leaderboardScoreColor = Color(0xFFD4AF37);

  // Top Scorers colors
  static const Color topScorersTextColor = Color(0xFF3E2723);
  static const Color topScorersMedalColor = Color(0xFFFFD700);
  static const Color topScorersBorderColor = Color(0xFFE0E0E0);
  static const Color topScorersCircleColor = Color(0xFFF5F5F5);
  static const Color topScorersNameColor = Color(0xFF3E2723);
  static const Color topScorersGradeColor = Color(0xFF5D4037);
  static const Color topScorersScoreColor = Color(0xFFD4AF37);

  // Settings colors
  static const Color settingsTitleColor = Color(0xFF3E2723);
  static const Color settingsBorderColor = Color(0xFFE0E0E0);
  static const Color settingsProfileTextColor = Color(0xFF3E2723);
  static const Color settingsProfilePrimaryColor = Color(0xFFD4AF37);
  static const Color settingsProfileSecondaryColor = Color(0xFF795548);
  static const Color settingsNotificationsTextColor = Color(0xFF3E2723);
  static const Color settingsNotificationsSubTextColor = Color(0xFF5D4037);
  static const Color settingsNotificationsActiveColor = Color(0xFFD4AF37);
  static const Color settingsNotificationsInactiveColor = Color(0xFFBDBDBD);
  static const Color settingsThemeTextColor = Color(0xFF3E2723);
  static const Color settingsThemeSubTextColor = Color(0xFF5D4037);
  static const Color settingsThemeLabelColor = Color(0xFF5D4037);
  static const Color settingsThemeBorderColor = Color(0xFFD4AF37);
  static const Color settingsThemeFocusedBorderColor = Color(0xFFD4AF37);

  // Gradient definitions for 3D effects
  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFD700), Color(0xFFD4AF37), Color(0xFFB8860B)],
  );

  static const LinearGradient brownGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF6D4C41), Color(0xFF5D4037), Color(0xFF4E342E)],
  );

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryGold,
      scaffoldBackgroundColor: lightCream,
      colorScheme: ColorScheme.light(
        primary: primaryGold,
        secondary: warmBrown,
        tertiary: accentGold,
        surface: white,
        onPrimary: deepBrown,
        onSecondary: white,
        onSurface: deepBrown,
      ),

      // AppBar Theme with 3D effect
      appBarTheme: AppBarTheme(
        backgroundColor: deepBrown,
        foregroundColor: primaryGold,
        elevation: 8,
        shadowColor: shadow,
        titleTextStyle: TextStyle(
          color: primaryGold,
          fontSize: 22,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),

      // Card Theme with 3D elevation
      cardTheme: CardThemeData(
        color: white,
        elevation: 12,
        shadowColor: shadow,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        margin: EdgeInsets.all(8),
      ),

      // Elevated Button with 3D gold effect
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGold,
          foregroundColor: deepBrown,
          elevation: 8,
          shadowColor: shadow,
          padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
          ),
        ),
      ),

      // Floating Action Button with gold gradient
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primaryGold,
        foregroundColor: deepBrown,
        elevation: 12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),

      // Input decoration with golden accent
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: warmBrown, width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: warmBrown, width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: primaryGold, width: 3),
        ),
        labelStyle: TextStyle(color: warmBrown),
        hintStyle: TextStyle(color: warmBrown.withValues(alpha: 0.6)),
      ),

      // Text theme
      textTheme: TextTheme(
        displayLarge: TextStyle(
          color: deepBrown,
          fontSize: 32,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: deepBrown,
          fontSize: 28,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: deepBrown,
          fontSize: 24,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: deepBrown,
          fontSize: 16,
        ),
        bodyMedium: TextStyle(
          color: mediumBrown,
          fontSize: 14,
        ),
      ),
    );
  }

  // 3D Box Decoration Helper
  static BoxDecoration get card3D => BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [white, Color(0xFFFFFBF5)],
    ),
    borderRadius: BorderRadius.circular(20),
    boxShadow: [
      BoxShadow(
        color: shadow,
        blurRadius: 20,
        spreadRadius: 2,
        offset: Offset(8, 8),
      ),
      BoxShadow(
        color: Colors.white.withValues(alpha: 0.7),
        blurRadius: 20,
        spreadRadius: 2,
        offset: Offset(-8, -8),
      ),
    ],
  );

  // Gold Button Decoration
  static BoxDecoration get goldButton3D => BoxDecoration(
    gradient: goldGradient,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: primaryGold.withValues(alpha: 0.5),
        blurRadius: 15,
        spreadRadius: 1,
        offset: Offset(0, 8),
      ),
    ],
  );

  // Brown Container Decoration
  static BoxDecoration get brownContainer3D => BoxDecoration(
    gradient: brownGradient,
    borderRadius: BorderRadius.circular(20),
    boxShadow: [
      BoxShadow(
        color: deepBrown.withValues(alpha: 0.6),
        blurRadius: 20,
        spreadRadius: 2,
        offset: Offset(6, 6),
      ),
    ],
  );
}
