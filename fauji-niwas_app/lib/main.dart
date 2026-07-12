import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  runApp(const FaujiNiwasApp());
}

class FaujiNiwasApp extends StatelessWidget {
  const FaujiNiwasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Fauji Niwas',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF030712),
        primaryColor: const Color(0xFFFF9933),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF9933),
          secondary: Color(0xFFFF9933),
          surface: Color(0xFF090D16),
        ),
      ),
      home: const PwaWebViewScreen(),
    );
  }
}

class PwaWebViewScreen extends StatefulWidget {
  const PwaWebViewScreen({super.key});

  @override
  State<PwaWebViewScreen> createState() => _PwaWebViewScreenState();
}

class _PwaWebViewScreenState extends State<PwaWebViewScreen>
    with SingleTickerProviderStateMixin {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _loadProgress = 0.0;
  late AnimationController _splashAnimController;
  late Animation<double> _splashFadeIn;
  late Animation<double> _splashScale;

  static const String _baseUrl = 'https://faujiniwas.web.app';

  @override
  void initState() {
    super.initState();

    _splashAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _splashFadeIn = CurvedAnimation(
      parent: _splashAnimController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    );
    _splashScale = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(
        parent: _splashAnimController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutBack),
      ),
    );
    _splashAnimController.forward();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF030712))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() => _loadProgress = progress / 100.0);
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _loadProgress = 0.0;
            });
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebResourceError [${error.errorCode}]: ${error.description}');
          },
          onNavigationRequest: (NavigationRequest request) {
            final uri = Uri.parse(request.url);
            if (uri.host == 'faujiniwas.web.app' ||
                uri.host == 'faujirentals.web.app' ||
                uri.host == 'fauji-adda.web.app' ||
                uri.host == 'localhost') {
              return NavigationDecision.navigate;
            }
            _launchExternalUrl(request.url);
            return NavigationDecision.prevent;
          },
        ),
      )
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/120.0.6099.230 '
        'Safari/537.36 FaujiNiwas/1.0',
      );

    _controller.loadRequest(Uri.parse('$_baseUrl/'));
  }

  Future<void> _launchExternalUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        debugPrint('Could not launch: $url');
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
    }
  }

  @override
  void dispose() {
    _splashAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),

            if (_isLoading)
              FadeTransition(
                opacity: _splashFadeIn,
                child: ScaleTransition(
                  scale: _splashScale,
                  child: Container(
                    color: const Color(0xFF030712),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 110,
                            height: 110,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(28),
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFFF9933),
                                  Color(0xFFF59E0B),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFFF9933).withValues(alpha: 0.3),
                                  blurRadius: 32,
                                  offset: Offset(0, 8),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Text(
                                'FN',
                                style: TextStyle(
                                  fontSize: 48,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: 1.5,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          ShaderMask(
                            shaderCallback: (bounds) => LinearGradient(
                              colors: [Color(0xFFFF9933), Color(0xFFFBBF24)],
                            ).createShader(bounds),
                            child: Text(
                              'FAUJI NIWAS',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2.0,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Verified Defence Housing',
                            style: TextStyle(
                              color: const Color(0xFF7A8FA8).withValues(alpha: 0.8),
                              fontSize: 13,
                              letterSpacing: 0.8,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 48),
                          SizedBox(
                            width: 200,
                            child: Column(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(3),
                                  child: LinearProgressIndicator(
                                    value: _loadProgress > 0 ? _loadProgress : null,
                                    minHeight: 4,
                                    backgroundColor: const Color(0xFF131B2E),
                                    valueColor: const AlwaysStoppedAnimation<Color>(
                                      Color(0xFFFF9933),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _loadProgress > 0 && !_loadProgress.isNaN
                                      ? '${(_loadProgress * 100).toInt()}%'
                                      : 'Connecting securely...',
                                  style: const TextStyle(
                                    color: Color(0xFF5A6F8A),
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
