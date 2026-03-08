import 'package:flutter/material.dart';

class SlidePageRoute extends PageRouteBuilder {
  final Widget Function(BuildContext) builder;

  SlidePageRoute({required this.builder})
      : super(
    pageBuilder: (context, animation, secondaryAnimation) =>
        builder(context),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(1.0, 0.0);
      const end = Offset.zero;
      const curve = Curves.easeInOutCubic;

      var tween =
      Tween(begin: begin, end: end).chain(CurveTween(curve: curve));

      return SlideTransition(
        position: animation.drive(tween),
        child: child,
      );
    },
    transitionDuration: const Duration(milliseconds: 600),
  );
}

class FadePageRoute extends PageRouteBuilder {
  final Widget Function(BuildContext) builder;

  FadePageRoute({required this.builder})
      : super(
    pageBuilder: (context, animation, secondaryAnimation) =>
        builder(context),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: animation,
        child: child,
      );
    },
    transitionDuration: const Duration(milliseconds: 500),
  );
}

class ScalePageRoute extends PageRouteBuilder {
  final Widget Function(BuildContext) builder;

  ScalePageRoute({required this.builder})
      : super(
    pageBuilder: (context, animation, secondaryAnimation) =>
        builder(context),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return ScaleTransition(
        scale: animation,
        child: child,
      );
    },
    transitionDuration: const Duration(milliseconds: 500),
  );
}
