// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_notifier.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$supabaseAccessTokenHash() =>
    r'35eb4e980fbac6f93c1623802aae1eb256f2201a';

/// See also [supabaseAccessToken].
@ProviderFor(supabaseAccessToken)
final supabaseAccessTokenProvider = Provider<String?>.internal(
  supabaseAccessToken,
  name: r'supabaseAccessTokenProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$supabaseAccessTokenHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef SupabaseAccessTokenRef = ProviderRef<String?>;
String _$authNotifierHash() => r'dbed5fed29890d615c75a05058860b9148960fcc';

/// See also [AuthNotifier].
@ProviderFor(AuthNotifier)
final authNotifierProvider = NotifierProvider<AuthNotifier, User?>.internal(
  AuthNotifier.new,
  name: r'authNotifierProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$authNotifierHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$AuthNotifier = Notifier<User?>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
