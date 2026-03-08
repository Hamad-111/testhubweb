import 'package:flutter/material.dart';
import '../../models/quiz_models.dart';
import '../../services/firebase_quiz_service.dart';
import '../../config/app_theme.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class QuizSessionScreen extends StatefulWidget {
  final Quiz quiz;

  const QuizSessionScreen({super.key, required this.quiz});

  @override
  State<QuizSessionScreen> createState() => _QuizSessionScreenState();
}

class _QuizSessionScreenState extends State<QuizSessionScreen> {
  final FirebaseQuizService _quizService = FirebaseQuizService();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<QuizResult>>(
      stream: (widget.quiz.pin != null && widget.quiz.pin!.isNotEmpty) 
          ? _quizService.getQuizResultsStream(widget.quiz.pin!)
          : Stream.value([]),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final results = snapshot.data ?? [];
        // Sort results by score (descending)
        results.sort((a, b) => b.score.compareTo(a.score));

        final top3 = results.take(3).toList();

        return DefaultTabController(
          length: 2,
          child: Scaffold(
            appBar: AppBar(
              title: const Text(
                'Quiz Session',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              flexibleSpace: Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.goldGradient,
                ),
              ),
              iconTheme: const IconThemeData(color: Colors.white),
              actions: [
                IconButton(
                  icon: const Icon(Icons.picture_as_pdf),
                  tooltip: 'Download PDF Report',
                  onPressed: () => _exportToPdf(context, widget.quiz, results),
                ),
                IconButton(
                  icon: const Icon(Icons.stop_circle_outlined),
                  tooltip: 'Stop Live Quiz',
                  onPressed: () => _showStopConfirmation(context),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_forever),
                  tooltip: 'End & Delete Quiz',
                  onPressed: () => _showDeleteConfirmation(context),
                ),
              ],
              bottom: const TabBar(
                indicatorColor: Colors.white,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70,
                tabs: [
                  Tab(text: 'Session', icon: Icon(Icons.analytics)),
                  Tab(text: 'Questions', icon: Icon(Icons.list)),
                ],
              ),
            ),
            body: TabBarView(
              children: [
                // Session Tab
                SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Quiz Info Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              widget.quiz.title,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1F2937),
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF7C4DFF).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                widget.quiz.pin != null ? 'PIN: ${widget.quiz.pin}' : 'PIN: NOT SET',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF7C4DFF),
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                _buildStatItem('Registered',
                                    '${results.length}', Icons.people),
                                _buildStatItem(
                                    'Questions',
                                    '${widget.quiz.questions.length}',
                                    Icons.help_outline),
                                _buildStatItem('Time',
                                    '${widget.quiz.timePerQuestion}s', Icons.timer),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Leaderboard (Top 3)
                      if (results.isNotEmpty) ...[
                        const Text(
                          '🏆 Top Performers',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          height: 260,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFF7C4DFF).withOpacity(0.05),
                                Colors.white,
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if (top3.length > 1)
                                _buildPodium(top3[1], 2,
                                    widget.quiz.questions.length), // Silver
                              if (top3.isNotEmpty)
                                _buildPodium(top3[0], 1,
                                    widget.quiz.questions.length), // Gold
                              if (top3.length > 2)
                                _buildPodium(top3[2], 3,
                                    widget.quiz.questions.length), // Bronze
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 30),

                      // All Students List
                      const Text(
                        '📋 All Students',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 15),
                      if (results.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            child: Text(
                              'No students have taken this quiz yet.',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: results.length,
                          itemBuilder: (context, index) {
                            final result = results[index];
                            final rank = index + 1;
                            return Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.grey.shade200,
                                  child: Text(
                                    '#$rank',
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                title: Text(
                                  result.studentName ?? 'Unknown',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                subtitle: result.studentEmail != null && result.studentEmail!.isNotEmpty
                                    ? Text(
                                        result.studentEmail!,
                                        style: TextStyle(color: Colors.grey[600], fontSize: 12),
                                      )
                                    : null,
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _getScoreColor(result.score,
                                            widget.quiz.questions.length)
                                        .withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${result.score} / ${widget.quiz.questions.length}',
                                    style: TextStyle(
                                      color: _getScoreColor(result.score,
                                          widget.quiz.questions.length),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),

                // Questions Tab
                ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: widget.quiz.questions.length,
                  itemBuilder: (context, index) {
                    final question = widget.quiz.questions[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 20),
                      elevation: 3,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor:
                                      const Color(0xFF7C4DFF).withOpacity(0.1),
                                  child: Text(
                                    '${index + 1}',
                                    style: const TextStyle(
                                      color: Color(0xFF7C4DFF),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: Text(
                                    question.text,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1F2937),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            ...question.options.asMap().entries.map((entry) {
                              final optionIndex = entry.key;
                              final optionText = entry.value;
                              final isCorrect =
                                  optionIndex == question.correctAnswerIndex;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isCorrect
                                      ? Colors.green.withOpacity(0.1)
                                      : Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isCorrect
                                        ? Colors.green
                                        : Colors.grey.shade200,
                                    width: isCorrect ? 2 : 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      isCorrect
                                          ? Icons.check_circle
                                          : Icons.circle_outlined,
                                      color: isCorrect
                                          ? Colors.green
                                          : Colors.grey.shade400,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        optionText,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isCorrect
                                              ? FontWeight.bold
                                              : FontWeight.normal,
                                          color: isCorrect
                                              ? Colors.green.shade700
                                              : Colors.black87,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.grey[600], size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1F2937),
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildPodium(QuizResult result, int rank, int totalQuestions) {
    final double height = rank == 1 ? 160 : (rank == 2 ? 130 : 100);
    final Color color = rank == 1
        ? const Color(0xFFFFD700) // Gold
        : (rank == 2 ? const Color(0xFFC0C0C0) : const Color(0xFFCD7F32)); // Silver : Bronze

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: color.withOpacity(0.2),
          child: Text(
            result.studentName?.isNotEmpty == true ? result.studentName![0].toUpperCase() : '?',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: 90,
          child: Text(
            result.studentName ?? 'Unknown',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            color: color.withOpacity(0.8),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '${result.score}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                ),
              ),
              Text(
                '/$totalQuestions',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getScoreColor(int score, int total) {
    double percentage = score / total;
    if (percentage >= 0.8) return Colors.green;
    if (percentage >= 0.5) return Colors.orange;
    return Colors.red;
  }

  Future<void> _exportToPdf(BuildContext context, Quiz quiz, List<QuizResult> results) async {
    try {
      final pdf = pw.Document();

      pdf.addPage(
        pw.MultiPage(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return [
              pw.Header(
                level: 0,
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Quiz Result Report', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
                    pw.Text(DateTime.now().toString().split(' ')[0]),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('Quiz Title: ${quiz.title}', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                  pw.Text('PIN: ${quiz.pin ?? 'N/A'}'),
                  pw.Text('Total Questions: ${quiz.questions.length}'),
                  pw.Text('Total Participants: ${results.length}'),
                ],
              ),
              pw.SizedBox(height: 20),
              pw.Table(
                border: pw.TableBorder.all(),
                columnWidths: {
                  0: const pw.FixedColumnWidth(40),
                  1: const pw.FlexColumnWidth(),
                  2: const pw.FixedColumnWidth(100),
                  3: const pw.FixedColumnWidth(80),
                },
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(color: PdfColors.grey300),
                    children: [
                      pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('No.', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Student Name', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Score', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                      pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('Accuracy', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                    ],
                  ),
                  ...results.asMap().entries.map((entry) {
                    final index = entry.key;
                    final res = entry.value;
                    return pw.TableRow(
                      children: [
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('${index + 1}')),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text(res.studentName ?? 'Unknown')),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('${res.score} / ${quiz.questions.length}')),
                        pw.Padding(padding: const pw.EdgeInsets.all(5), child: pw.Text('${res.accuracy.toStringAsFixed(1)}%')),
                      ],
                    );
                  }),
                ],
              ),
            ];
          },
        ),
      );

      await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => pdf.save(),
        name: '${quiz.title.replaceAll(' ', '_')}_Results.pdf',
      );
    } catch (e) {
      debugPrint('Error exporting PDF: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error generating PDF: $e')),
        );
      }
    }
  }

  void _showStopConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Stop Live Quiz?'),
        content: const Text('Students will no longer be able to join or see this quiz in the active list. Existing results will be saved.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C4DFF)),
            onPressed: () async {
              if (widget.quiz.pin == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Error: Quiz ID is missing')),
                );
                return;
              }
              try {
                await _quizService.stopQuiz(widget.quiz.pin!);
                if (context.mounted) {
                  Navigator.pop(context); // Pop dialog
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Quiz stopped/unpublished successfully'),
                      backgroundColor: Colors.blue,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Stop', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('End & Delete Quiz?'),
        content: Text('Are you sure you want to permanently end and delete "${widget.quiz.title}"? This will remove all progress.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              if (widget.quiz.pin == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Error: Quiz ID is missing')),
                );
                return;
              }
              try {
                await _quizService.deleteQuiz(widget.quiz.pin!);
                if (context.mounted) {
                  Navigator.pop(context); // Pop dialog
                  Navigator.pop(context); // Exit session screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Quiz deleted successfully'), backgroundColor: Colors.red),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
