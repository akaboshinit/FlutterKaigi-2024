import 'dart:async';

import 'package:collection/collection.dart';
import 'package:common_data/news.dart';
import 'package:conference_2024_website/ui/components/button/app_button.dart';
import 'package:conference_2024_website/ui/home/notifier/news_data_notifier.dart';
import 'package:conference_2024_website/ui/home/notifier/news_data_state.dart';
import 'package:conference_2024_website/ui/theme/extension/theme_extension.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:gap/gap.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';


class NewsComponent extends ConsumerWidget {
  const NewsComponent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final textTheme = theme.customThemeExtension.textTheme;
    final colorTheme = theme.customThemeExtension.colorTheme;

    final newsDataState = ref.watch(newsDataNotifierProvider);
    final newsDataNotifier = ref.read(newsDataNotifierProvider.notifier);

    useEffect(() {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        unawaited(newsDataNotifier.getNews());
      });
      return null;
    }, const [],);

    return switch (newsDataState) {
      NewsDataInitial() ||
      NewsDataLoading() => const Center(child: CircularProgressIndicator()),
      NewsDataLoaded(news: final news) =>
          _newsList(news, textTheme, colorTheme),
      NewsDataError(message: final message) => Center(child: Text(message)),
    };
  }

  Widget _newsList(List<News> news,
      TextThemeExtension textTheme,
      ColorThemeExtension colorTheme,) {
    final backgroundColor = Colors.white.withOpacity(0.6);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: news.mapIndexed((index, news) {
        return DecoratedBox(
          decoration: BoxDecoration(
            color: backgroundColor,
            boxShadow: const [
              BoxShadow(
                blurRadius: 4,
                offset: Offset(2, 2),
                color: Color.fromRGBO(168, 168, 168, 0.25),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 日付
                Text(
                  news.startedAt.toLocal().toString(),
                  style: textTheme.body
                ),
                const Gap(4),
                // リンクボタン
                AppButton.primaryLink(
                  label: Text(news.text),
                  link: news.url,
                ),
              ],
            )
          ),
        );
      }).toList(),
    );
  }
}