import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user_model.dart';

class FirebaseAuthService {
  final auth.FirebaseAuth _auth = auth.FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  auth.User? get currentUser => _auth.currentUser;
  Stream<auth.User?> get authStateChanges => _auth.authStateChanges();

  Future<AppUser?> signUpWithEmail({
    required String email,
    required String password,
    required String name,
    required UserRole role,
    String? institution,
  }) async {
    try {
      debugPrint('[v0] FirebaseAuthService: Starting signup');
      debugPrint('[v0] Email: $email, Role: $role');

      final auth.UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      debugPrint('[v0] Firebase user created: ${credential.user?.uid}');

      if (credential.user != null) {
        final userModel = AppUser(
          id: credential.user!.uid,
          email: email,
          name: name,
          role: role,
          institution: institution,
          createdAt: DateTime.now(),
          status: role == UserRole.instructor ? UserStatus.pending : UserStatus.active,
        );
        
        await _firestore.collection('users').doc(userModel.id).set(userModel.toMap());
        return userModel;
      }
      return null;
    } on auth.FirebaseAuthException catch (e) {
      debugPrint('[v0] Firebase Auth exception: ${e.code} - ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[v0] Firebase Auth signup error: $e');
      rethrow;
    }
  }


  Future<AppUser?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    auth.UserCredential? credential;

    try {
      debugPrint('[v0] FirebaseAuthService: Starting signInWithEmailAndPassword');
      debugPrint('[v0] Email: $email');

      credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      debugPrint('[v0] Firebase Auth successful');
      debugPrint('[v0] User UID: ${credential.user?.uid}');
    } on auth.FirebaseAuthException catch (e) {
      debugPrint('[v0] Firebase Auth exception: ${e.code} - ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[v0] Firebase Auth signin error (type cast): $e');

      if (e.toString().contains('PigeonUserDetails')) {
        debugPrint('[v0] Type cast error detected, using currentUser instead');
        await Future.delayed(Duration(milliseconds: 500));
        credential = null;
      } else {
        rethrow;
      }
    }

    try {
      final user = credential?.user ?? _auth.currentUser;

      if (user != null) {
        debugPrint('[v0] Fetching user document from Firestore...');
        final isAdmin = email == 'shakirullah1515@gmail.com';

        try {
          final doc = await _firestore.collection('users').doc(user.uid).get();

          debugPrint('[v0] Firestore document exists: ${doc.exists}');

          if (doc.exists) {
            final userData = doc.data()!;
            debugPrint('[v0] User data retrieved: ${userData['email']}, Role: ${userData['role']}');
            
            AppUser appUser = AppUser.fromMap(userData);
            if (isAdmin && appUser.role != UserRole.admin) {
              appUser = appUser.copyWith(role: UserRole.admin);
              await _firestore.collection('users').doc(user.uid).update({'role': 'admin'});
            }
            return appUser;
          } else {
            debugPrint('[v0] User document does not exist, creating default user');
            final defaultUser = AppUser(
              id: user.uid,
              email: email,
              name: user.displayName ?? 'User',
              role: isAdmin ? UserRole.admin : UserRole.student,
              status: UserStatus.active,
              createdAt: DateTime.now(),
            );
            
            await _firestore.collection('users').doc(user.uid).set(defaultUser.toMap());
            return defaultUser;
          }
        } on FirebaseException catch (firestoreError) {
          if (firestoreError.code == 'unavailable' ||
              firestoreError.message?.contains('does not exist') == true) {
            debugPrint('[v0] Firestore database not initialized, using default user');
            debugPrint('[v0] Please create Firestore database in Firebase Console');

            // Return default user to allow login
            return AppUser(
              id: user.uid,
              email: email,
              name: user.displayName ?? 'User',
              role: UserRole.student,
              status: UserStatus.active,
              createdAt: DateTime.now(),
            );
          }
          debugPrint('[v0] Firestore error: ${firestoreError.code} - ${firestoreError.message}');
          rethrow;
        }
      }

      debugPrint('[v0] Returning null - no user data found');
      return null;
    } catch (e) {
      debugPrint('[v0] Unexpected error: $e');
      rethrow;
    }
  }

  Future<AppUser?> signInWithGoogle() async {
    try {
      debugPrint('[v0] FirebaseAuthService: Starting signInWithGoogle');
      
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      
      if (googleUser == null) {
        debugPrint('[v0] Google Sign-In cancelled by user');
        return null;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final auth.AuthCredential credential = auth.GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final auth.UserCredential userCredential = await _auth.signInWithCredential(credential);
      final auth.User? user = userCredential.user;

      if (user != null) {
        debugPrint('[v0] Google Sign-In successful for UID: ${user.uid}');
        
        // Fetch/Initialize user document in Firestore
        final doc = await _firestore.collection('users').doc(user.uid).get();
        
        if (doc.exists) {
          return AppUser.fromMap(doc.data()!);
        } else {
          // Default to student role for new Google users
          final newUser = AppUser(
            id: user.uid,
            email: user.email ?? '',
            name: user.displayName ?? 'Google User',
            role: UserRole.student,
            status: UserStatus.active,
            createdAt: DateTime.now(),
          );
          await _firestore.collection('users').doc(user.uid).set(newUser.toMap());
          return newUser;
        }
      }
      return null;
    } catch (e) {
      debugPrint('[v0] Google Sign-In error: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    debugPrint('[v0] Signing out user');
    await _auth.signOut();
  }

  /// Check if user is already authenticated and restore session
  /// This method is called on app startup to restore existing sessions
  /// Firebase Auth automatically persists sessions and handles token refresh
  Future<AppUser?> checkAuthState() async {
    try {
      debugPrint('[v0] Checking authentication state...');
      
      // Get current user from Firebase Auth
      final user = _auth.currentUser;
      
      if (user == null) {
        debugPrint('[v0] No authenticated user found');
        return null;
      }

      debugPrint('[v0] Found authenticated user: ${user.uid}');
      debugPrint('[v0] Email: ${user.email}');

      // Force token refresh to ensure it's valid
      // Firebase automatically refreshes tokens, but we can force it here
      try {
        await user.getIdToken(true); // true forces refresh
        debugPrint('[v0] Token refreshed successfully');
      } catch (tokenError) {
        debugPrint('[v0] Token refresh failed: $tokenError');
        // If token refresh fails, sign out the user
        await signOut();
        return null;
      }

      // Fetch user data from Firestore
      try {
        final doc = await _firestore.collection('users').doc(user.uid).get();
        final isAdmin = user.email == 'shakirullah1515@gmail.com';
        
        if (doc.exists) {
          final userData = doc.data()!;
          debugPrint('[v0] User data retrieved from Firestore');
          debugPrint('[v0] Role: ${userData['role']}, Status: ${userData['status']}');
          
          AppUser appUser = AppUser.fromMap(userData);
          if (isAdmin && appUser.role != UserRole.admin) {
            appUser = appUser.copyWith(role: UserRole.admin);
            await _firestore.collection('users').doc(user.uid).update({'role': 'admin'});
          }
          return appUser;
        } else {
          debugPrint('[v0] User document not found in Firestore');
          // Create default user document if it doesn't exist
          final defaultUser = AppUser(
            id: user.uid,
            email: user.email ?? '',
            name: user.displayName ?? 'User',
            role: isAdmin ? UserRole.admin : UserRole.student,
            status: UserStatus.active,
            createdAt: DateTime.now(),
          );
          
          try {
            await _firestore.collection('users').doc(user.uid).set(defaultUser.toMap());
            debugPrint('[v0] Created default user document');
          } catch (saveError) {
            debugPrint('[v0] Could not save default user: $saveError');
          }
          
          return defaultUser;
        }
      } on FirebaseException catch (firestoreError) {
        debugPrint('[v0] Firestore error: ${firestoreError.code} - ${firestoreError.message}');
        
        // If Firestore is unavailable, return a default user to allow login
        if (firestoreError.code == 'unavailable' || 
            firestoreError.message?.contains('does not exist') == true) {
          debugPrint('[v0] Firestore unavailable, using default user');
          return AppUser(
            id: user.uid,
            email: user.email ?? '',
            name: user.displayName ?? 'User',
            role: UserRole.student,
            status: UserStatus.active,
            createdAt: DateTime.now(),
          );
        }
        
        rethrow;
      }
    } catch (e) {
      debugPrint('[v0] Error checking auth state: $e');
      return null;
    }
  }

  Future<AppUser?> getUserData(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      if (doc.exists) {
        return AppUser.fromMap(doc.data()!);
      }
      return null;
    } catch (e) {
      debugPrint('[Firebase Auth] Get user data error: $e');
      return null;
    }
  }

  Future<void> updateUserProfile({
    required String userId,
    String? name,
    String? photoUrl,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (name != null) updates['name'] = name;
      if (photoUrl != null) updates['photoUrl'] = photoUrl;

      await _firestore.collection('users').doc(userId).update(updates);

      if (name != null) {
        await currentUser?.updateDisplayName(name);
      }
      if (photoUrl != null) {
        await currentUser?.updatePhotoURL(photoUrl);
      }
    } catch (e) {
      debugPrint('[Firebase Auth] Update profile error: $e');
      rethrow;
    }
  }
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      debugPrint('[Firebase Auth] Sending password reset email to: $email');
      await _auth.sendPasswordResetEmail(email: email);
    } catch (e) {
      debugPrint('[Firebase Auth] Pass reset error: $e');
      rethrow;
    }
  }

  Future<void> deleteUserDocument(String userId) async {
    try {
      debugPrint('[Firebase Auth] Deleting user document: $userId');
      await _firestore.collection('users').doc(userId).delete();
    } catch (e) {
      debugPrint('[Firebase Auth] Delete user error: $e');
      rethrow;
    }
  }
}
