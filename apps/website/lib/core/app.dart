import 'package:conference_2024_website/core/router/router.dart';
import 'package:conference_2024_website/gen/i18n/strings.g.dart';
import 'package:conference_2024_website/ui/theme/theme.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:performance/performance.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final i18n = Translations.of(context);
    final router = ref.watch(goRouteProvider);

    return MaterialApp.router(
      title: '${i18n.title} ${i18n.year} (akaboshinit)',
      locale: TranslationProvider.of(context).flutterLocale,
      supportedLocales: AppLocaleUtils.supportedLocales,
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      routerConfig: router,
      theme: lightTheme(),
      themeMode: ThemeMode.light,
      builder: (context, child) {
        return Scaffold(
          body: CustomPerformanceOverlay(
            alignment: Alignment.bottomRight,
            child: Stack(
              children: [
                child!,
                Column(
                  children: [
                    const Text('kIsWasm: $kIsWasm'),
                    InkWell(
                      onTap: () {
                        throw UnimplementedError();
                      },
                      child: const Text('throw()'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
