
enum UserRole { student, instructor, admin }

enum UserStatus { pending, active, rejected }

class AppUser {
  final String id;
  final String email;
  final String name;
  final String? photoUrl;
  final UserRole role;
  final String? schoolCode; // For students
  final String? institution; // For instructors
  final UserStatus status; // Only for instructors
  final DateTime createdAt;
  final DateTime? lastLogin;
  final String? subscriptionStatus;
  final String? planId;
  final DateTime? subscriptionExpiry;

  AppUser({
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
    required this.role,
    this.schoolCode,
    this.institution,
    this.status = UserStatus.pending,
    required this.createdAt,
    this.lastLogin,
    this.subscriptionStatus,
    this.planId,
    this.subscriptionExpiry,
  });

  AppUser copyWith({
    String? id,
    String? email,
    String? name,
    String? photoUrl,
    UserRole? role,
    String? schoolCode,
    String? institution,
    UserStatus? status,
    DateTime? createdAt,
    DateTime? lastLogin,
    String? subscriptionStatus,
    String? planId,
    DateTime? subscriptionExpiry,
  }) {
    return AppUser(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      photoUrl: photoUrl ?? this.photoUrl,
      role: role ?? this.role,
      schoolCode: schoolCode ?? this.schoolCode,
      institution: institution ?? this.institution,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
      planId: planId ?? this.planId,
      subscriptionExpiry: subscriptionExpiry ?? this.subscriptionExpiry,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'photoUrl': photoUrl,
      'role': role.name,
      'schoolCode': schoolCode,
      'institution': institution,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
      'subscriptionStatus': subscriptionStatus,
      'planId': planId,
      'subscriptionExpiry': subscriptionExpiry?.toIso8601String(),
    };
  }

  factory AppUser.fromMap(Map<String, dynamic> map) {
    return AppUser(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      photoUrl: map['photoUrl'],
      role: UserRole.values.firstWhere(
            (e) => e.name == map['role'],
        orElse: () => UserRole.student,
      ),
      schoolCode: map['schoolCode'],
      institution: map['institution'],
      status: UserStatus.values.firstWhere(
            (e) => e.name == map['status'],
        orElse: () => UserStatus.pending,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      lastLogin: map['lastLogin'] != null ? DateTime.parse(map['lastLogin']) : null,
      subscriptionStatus: map['subscriptionStatus'],
      planId: map['planId'],
      subscriptionExpiry: map['subscriptionExpiry'] != null ? DateTime.parse(map['subscriptionExpiry']) : null,
    );
  }
}
