import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

class FileService {
  static Future<String?> pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['txt', 'pdf', 'doc', 'docx'],
      );

      if (result != null && result.files.single.path != null) {
        return result.files.single.path;
      }
      return null;
    } catch (e) {
      throw Exception('Failed to pick file: $e');
    }
  }

  static Future<String> readTextFile(String filePath) async {
    try {
      final file = File(filePath);
      final contents = await file.readAsString();
      return contents;
    } catch (e) {
      throw Exception('Failed to read file: $e');
    }
  }

  static Future<String> readPdfFile(String filePath) async {
    try {
      final file = File(filePath);
      final bytes = await file.readAsBytes();

      // Load the PDF document
      final PdfDocument document = PdfDocument(inputBytes: bytes);

      // Extract text from the entire document
      String text = PdfTextExtractor(document).extractText();

      // Dispose the document
      document.dispose();

      return text;
    } catch (e) {
      throw Exception('Failed to read PDF: $e');
    }
  }

  static Future<String> getFileContent(String filePath) async {
    final extension = filePath.split('.').last.toLowerCase();

    switch (extension) {
      case 'txt':
        return readTextFile(filePath);
      case 'pdf':
        return readPdfFile(filePath);
      default:
        return readTextFile(filePath);
    }
  }
}
