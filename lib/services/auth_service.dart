import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  AppUser? _currentUser;
  bool _isLoading = false;

  AppUser? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  AuthService() {
    _auth.authStateChanges().listen(_onAuthStateChanged);
  }

  Future<void> _onAuthStateChanged(User? firebaseUser) async {
    if (firebaseUser == null) {
      _currentUser = null;
    } else {
      await _fetchAppUser(firebaseUser.uid);
    }
    notifyListeners();
  }

  Future<void> _fetchAppUser(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        _currentUser = AppUser.fromMap(doc.data()!);
      }
    } catch (e) {
      // Handle error, maybe log it
      if (kDebugMode) {
        debugPrint('Failed to fetch app user: $e');
      }
      _currentUser = null;
    }
  }

  Future<bool> signUp({
    required String email,
    required String password,
    required String name,
    required UserRole role,
    String? schoolCode,
    String? institution,
  }) async {
    _setLoading(true);
    try {
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      User? firebaseUser = userCredential.user;
      if (firebaseUser != null) {
        AppUser newUser = AppUser(
          id: firebaseUser.uid,
          email: email,
          name: name,
          role: role,
          schoolCode: schoolCode,
          institution: institution,
          status: role == UserRole.instructor ? UserStatus.pending : UserStatus.active,
          createdAt: DateTime.now(),
        );

        await _firestore.collection('users').doc(firebaseUser.uid).set(newUser.toMap());
        _currentUser = newUser;
        _setLoading(false);
        return true;
      }
      _setLoading(false);
      return false;
    } on FirebaseAuthException catch (e) {
      // Handle Firebase-specific errors (e.g., email-already-in-use)
      if (kDebugMode) {
        debugPrint('SignUp failed: ${e.message}');
      }
      _setLoading(false);
      return false;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('SignUp failed with general error: $e');
      }
      _setLoading(false);
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      // Auth state change will be picked up by the listener, which calls _fetchAppUser
      _setLoading(false);
      return true;
    } on FirebaseAuthException catch (e) {
      if (kDebugMode) {
        debugPrint('Login failed: ${e.message}');
      }
      _setLoading(false);
      return false;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Login failed with general error: $e');
      }
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
    _currentUser = null;
    notifyListeners();
  }
  
  // Helper to reduce boilerplate
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
