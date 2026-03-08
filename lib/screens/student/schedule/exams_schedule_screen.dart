import 'package:flutter/material.dart';
import '../../../models/schedule_models.dart';
import '../../../services/schedule_service.dart';

class ExamsScheduleScreen extends StatefulWidget {
  const ExamsScheduleScreen({super.key});

  @override
  State<ExamsScheduleScreen> createState() => _ExamsScheduleScreenState();
}

class _ExamsScheduleScreenState extends State<ExamsScheduleScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Exam> _exams;

  @override
  void initState() {
    super.initState();
    _exams = ScheduleService.getExams();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final upcomingExams = ScheduleService.getUpcomingExams();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF2196F3),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Exam Schedule',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () {
              // TODO: Navigate to add exam screen
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Add Exam feature coming soon!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (upcomingExams.isNotEmpty) ...[
              const Text(
                'Upcoming Exams',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 15),
              ..._buildUpcomingExams(upcomingExams),
              const SizedBox(height: 30),
            ],
            const Text(
              'All Exams',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 15),
            ..._buildAllExams(),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildUpcomingExams(List<Exam> exams) {
    return List.generate(
      exams.length > 2 ? 2 : exams.length,
          (index) {
        final exam = exams[index];
        return _ExamCountdownCard(
          animationController: _animationController,
          delay: index * 0.15,
          exam: exam,
        );
      },
    );
  }

  List<Widget> _buildAllExams() {
    return List.generate(_exams.length, (index) {
      return _ExamCountdownCard(
        animationController: _animationController,
        delay: (index + 2) * 0.1,
        exam: _exams[index],
      );
    });
  }
}

class _ExamCountdownCard extends StatefulWidget {
  final AnimationController animationController;
  final double delay;
  final Exam exam;

  const _ExamCountdownCard({
    required this.animationController,
    required this.delay,
    required this.exam,
  });

  @override
  State<_ExamCountdownCard> createState() => _ExamCountdownCardState();
}

class _ExamCountdownCardState extends State<_ExamCountdownCard>
    with TickerProviderStateMixin {
  late AnimationController _countdownController;

  @override
  void initState() {
    super.initState();
    _countdownController = AnimationController(
      duration: const Duration(seconds: 60),
      vsync: this,
    );
    _countdownController.repeat();
  }

  @override
  void dispose() {
    _countdownController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final delayedAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: widget.animationController,
        curve: Interval(widget.delay, widget.delay + 0.3, curve: Curves.easeOut),
      ),
    );

    final timeRemaining = widget.exam.timeRemaining;
    final days = timeRemaining.inDays;
    final hours = timeRemaining.inHours.remainder(24);
    final minutes = timeRemaining.inMinutes.remainder(60);

    return AnimatedBuilder(
      animation: delayedAnimation,
      builder: (context, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.3, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: widget.animationController,
            curve: Interval(widget.delay, widget.delay + 0.3, curve: Curves.easeOut),
          )),
          child: Opacity(
            opacity: delayedAnimation.value,
            child: Container(
              margin: const EdgeInsets.only(bottom: 15),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    widget.exam.color.withValues(alpha: 0.1),
                    widget.exam.color.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: widget.exam.color.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: widget.exam.color.withValues(alpha: 0.1),
                    blurRadius: 10,
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.exam.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1F2937),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Marks: ${widget.exam.totalMarks}',
                              style: TextStyle(
                                fontSize: 12,
                                color: widget.exam.color,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: widget.exam.isMidterm
                              ? Colors.orange.withValues(alpha: 0.2)
                              : Colors.purple.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          widget.exam.isMidterm ? 'Midterm' : 'Final',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: widget.exam.isMidterm
                                ? Colors.orange
                                : Colors.purple,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: widget.exam.color.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: widget.exam.color.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Time Remaining',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7280),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _CountdownUnit(
                              value: days.toString().padLeft(2, '0'),
                              unit: 'Days',
                              color: widget.exam.color,
                            ),
                            Text(
                              ':',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: widget.exam.color,
                              ),
                            ),
                            _CountdownUnit(
                              value: hours.toString().padLeft(2, '0'),
                              unit: 'Hrs',
                              color: widget.exam.color,
                            ),
                            Text(
                              ':',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: widget.exam.color,
                              ),
                            ),
                            _CountdownUnit(
                              value: minutes.toString().padLeft(2, '0'),
                              unit: 'Mins',
                              color: widget.exam.color,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(
                        child: _InfoRow(
                          icon: Icons.calendar_today,
                          text: widget.exam.date.toString().split(' ')[0],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _InfoRow(
                          icon: Icons.access_time,
                          text: '${widget.exam.startTime.format(context)} (${widget.exam.duration.inHours}h)',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _InfoRow(
                    icon: Icons.location_on,
                    text: widget.exam.location,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _CountdownUnit extends StatelessWidget {
  final String value;
  final String unit;
  final Color color;

  const _CountdownUnit({
    required this.value,
    required this.unit,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          unit,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF6B7280)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
