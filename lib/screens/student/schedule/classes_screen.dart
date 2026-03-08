import 'package:flutter/material.dart';
import '../../../models/schedule_models.dart';
import '../../../services/schedule_service.dart';

class ClassesScreen extends StatefulWidget {
  const ClassesScreen({super.key});

  @override
  State<ClassesScreen> createState() => _ClassesScreenState();
}

class _ClassesScreenState extends State<ClassesScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late List<Class> _classes;

  @override
  void initState() {
    super.initState();
    _classes = ScheduleService.getClasses();
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
    final todaysClasses = ScheduleService.getClassesToday();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF2196F3),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'My Classes',
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
              // TODO: Navigate to add class screen
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Add Class feature coming soon!')),
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
            if (todaysClasses.isNotEmpty) ...[
              const Text(
                "Today's Classes",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 15),
              ..._buildTodaysClasses(todaysClasses),
              const SizedBox(height: 30),
            ],
            const Text(
              'All Classes',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 15),
            ..._buildAllClasses(),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildTodaysClasses(List<Class> classes) {
    return List.generate(classes.length, (index) {
      final classItem = classes[index];
      return _AnimatedClassCard(
        animationController: _animationController,
        delay: index * 0.1,
        classItem: classItem,
        isToday: true,
      );
    });
  }

  List<Widget> _buildAllClasses() {
    return List.generate(_classes.length, (index) {
      return _AnimatedClassCard(
        animationController: _animationController,
        delay: (index + (_classes.length > 3 ? 3 : 0)) * 0.1,
        classItem: _classes[index],
        isToday: false,
      );
    });
  }
}

class _AnimatedClassCard extends StatelessWidget {
  final AnimationController animationController;
  final double delay;
  final Class classItem;
  final bool isToday;

  const _AnimatedClassCard({
    required this.animationController,
    required this.delay,
    required this.classItem,
    required this.isToday,
  });

  @override
  Widget build(BuildContext context) {
    final delayedAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: animationController,
        curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
      ),
    );

    return AnimatedBuilder(
      animation: delayedAnimation,
      builder: (context, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.3, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animationController,
            curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
          )),
          child: Opacity(
            opacity: delayedAnimation.value,
            child: Container(
              margin: const EdgeInsets.only(bottom: 15),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    classItem.color.withValues(alpha: 0.1),
                    classItem.color.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: classItem.color.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: classItem.color.withValues(alpha: 0.1),
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
                              classItem.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1F2937),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              classItem.subject,
                              style: TextStyle(
                                fontSize: 12,
                                color: classItem.color,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (isToday)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            '🔴 Now',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(
                        child: _InfoChip(
                          icon: Icons.access_time,
                          label: '${classItem.startTime.format(context)} - ${classItem.endTime.format(context)}',
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _InfoChip(
                          icon: Icons.location_on,
                          label: classItem.room,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _InfoChip(
                    icon: Icons.person,
                    label: classItem.teacher,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Schedule: ${classItem.days.join(", ")}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
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

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({
    required this.icon,
    required this.label,
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
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF6B7280)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              label,
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
