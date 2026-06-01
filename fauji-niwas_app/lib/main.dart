import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
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
        scaffoldBackgroundColor: const Color(0xFF0B1325),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0B1325),
          brightness: Brightness.dark,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();

    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            transitionDuration: const Duration(milliseconds: 500),
            pageBuilder: (_, __, ___) => const WebViewScreen(),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1325),
      body: FadeTransition(
        opacity: _fade,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'assets/logo.png',
                  width: 120,
                  height: 120,
                ),
              ),
              const SizedBox(height: 24),
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                  ),
                  children: [
                    TextSpan(
                      text: 'Fauji',
                      style: TextStyle(color: Color(0xFFFF9933)), // Saffron
                    ),
                    TextSpan(
                      text: ' Niwas',
                      style: TextStyle(color: Color(0xFFFFFFFF)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Defence Housing — Simplified',
                style: TextStyle(
                  color: Color(0xFF7A8FA8),
                  fontSize: 14,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 48),
              const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Color(0xFFFF9933),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    _controller = WebViewController(
      onPermissionRequest: (request) async {
        final grantable = {
          WebViewPermissionResourceType.microphone,
          WebViewPermissionResourceType.camera,
        };
        if (request.types.any((t) => grantable.contains(t))) {
          await request.grant();
        }
      },
    );

    await _controller.clearCache();
    await WebViewCookieManager().clearCookies();

    _controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0B1325))
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 FaujiNiwas/1.0',
      )
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) {
          setState(() {
            _isLoading = true;
            _errorMessage = null;
          });
          _controller.runJavaScript('''
            window.faujiApp = true;
            document.documentElement.classList.add('is-native');
          ''');
        },
        onPageFinished: (url) {
          setState(() => _isLoading = false);
          _controller.runJavaScript('''
            (function() {
              window.faujiApp = true;
              document.documentElement.classList.add('is-native');
              var meta = document.querySelector('meta[name="viewport"]');
              if (meta) {
                meta.setAttribute('content',
                  'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no');
              }
            })();
          ''');
        },
        onWebResourceError: (error) {
          setState(() {
            _isLoading = false;
            _errorMessage = "Network Error: ${error.description}";
          });
        },
      ))
      ..loadRequest(Uri.parse('https://faujiniwas.web.app/'));

    if (_controller.platform is AndroidWebViewController) {
      final androidCtrl = _controller.platform as AndroidWebViewController;
      await androidCtrl.setGeolocationEnabled(true);
      await androidCtrl.setMediaPlaybackRequiresUserGesture(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          _controller.goBack();
        } else {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0B1325),
        body: SafeArea(
          top: false,
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading)
                Container(
                  color: const Color(0xFF0B1325),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: Color(0xFFFF9933),
                          strokeWidth: 2.5,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Loading Tactical Interface...',
                          style: TextStyle(
                            color: Color(0xFF7A8FA8),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              if (_errorMessage != null)
                Container(
                  color: const Color(0xFF0B1325),
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.wifi_off_rounded, color: Colors.redAccent, size: 48),
                        const SizedBox(height: 16),
                        const Text(
                          'CONNECTION OFFLINE',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF7A8FA8), fontSize: 13),
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton(
                          onPressed: () => _controller.reload(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF9933),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                          ),
                          child: const Text('RETRY CONNECTION'),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
