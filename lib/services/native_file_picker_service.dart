import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';

class NativeFilePickerService {
  static const platform = MethodChannel('com.example.testhub1/files');

  static Future<String?> pickFile() async {
    try {
      await platform.invokeMethod('pickFile');
      return null;
    } catch (e) {
      debugPrint("Error picking file: $e");
      return null;
    }
  }

  static void setupResultListener(Function(String path, String uri) onResult) {
    platform.setMethodCallHandler((call) async {
      if (call.method == 'filePickerResult') {
        final path = call.arguments['path'] as String;
        final uri = call.arguments['uri'] as String;
        onResult(path, uri);
      }
    });
  }
}
