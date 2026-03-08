import 'package:flutter/material.dart';

class AnimatedFab extends StatefulWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final Color backgroundColor;
  final String tooltip;

  const AnimatedFab({
    super.key,
    required this.onPressed,
    required this.icon,
    this.backgroundColor = const Color(0xFF2196F3),
    this.tooltip = '',
  });

  @override
  State<AnimatedFab> createState() => _AnimatedFabState();
}

class _AnimatedFabState extends State<AnimatedFab>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    _rotationAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: RotationTransition(
        turns: _rotationAnimation,
        child: FloatingActionButton(
          onPressed: widget.onPressed,
          backgroundColor: widget.backgroundColor,
          tooltip: widget.tooltip,
          child: Icon(widget.icon),
        ),
      ),
    );
  }
}
