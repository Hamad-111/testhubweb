import 'package:flutter/material.dart';

class AnimatedModal extends StatefulWidget {
  final String title;
  final String content;
  final VoidCallback onConfirm;
  final VoidCallback? onCancel;
  final String confirmText;
  final String cancelText;

  const AnimatedModal({
    super.key,
    required this.title,
    required this.content,
    required this.onConfirm,
    this.onCancel,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
  });

  @override
  State<AnimatedModal> createState() => _AnimatedModalState();
}

class _AnimatedModalState extends State<AnimatedModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

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

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
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
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AlertDialog(
          title: Text(widget.title),
          content: Text(widget.content),
          actions: [
            if (widget.onCancel != null)
              TextButton(
                onPressed: () {
                  widget.onCancel!();
                  Navigator.pop(context);
                },
                child: Text(widget.cancelText),
              ),
            TextButton(
              onPressed: () {
                widget.onConfirm();
                Navigator.pop(context);
              },
              child: Text(widget.confirmText),
            ),
          ],
        ),
      ),
    );
  }
}
