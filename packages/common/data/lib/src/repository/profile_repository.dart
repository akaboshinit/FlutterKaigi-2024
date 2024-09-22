import 'dart:typed_data';

import 'package:common_data/session.dart';
import 'package:common_data/src/model/profile.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileRepository {
  ProfileRepository({
    required SupabaseClient client,
  }) : _client = client;

  final SupabaseClient _client;

  /// プロフィールを取得します
  /// [userId] はユーザーID
  /// `role`が`admin`以外の場合は、自分のプロフィールしか取得できません
  /// 取得可能なプロフィールがない場合は`null`を返します
  Future<Profile?> fetchProfileByUserId(String userId) async => _client
      .from('profiles')
      .select()
      .eq('id', userId)
      .maybeSingle()
      .withConverter((e) => e != null ? Profile.fromJson(e) : null);

  /// プロフィールとそれに紐づくSNSアカウントを取得します
  /// [userId] はユーザーID
  /// `role`が`admin`以外の場合は、自分のプロフィールしか取得できません
  /// 取得可能なプロフィールがない場合は`null`を返します
  Future<ProfileWithSns?> fetchProfileWithSnsByUserId(String userId) async =>
      _client
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle()
          .withConverter((e) => e != null ? ProfileWithSns.fromJson(e) : null);

  /// プロフィールを取得します
  /// [limit] は取得する件数
  /// [offset] は取得する位置
  /// `role`が`admin`の場合は全てのプロフィールを取得できますが、
  /// それ以外の場合は自分のプロフィールしか取得できません
  Future<PagingResult<List<Profile>>> fetchProfiles({
    int limit = 10,
    int offset = 0,
  }) async {
    final result = await _client
        .from('profiles')
        .select()
        .range(offset, offset + limit)
        .count(CountOption.exact)
        .withConverter((e) => e.map(Profile.fromJson).toList());

    return PagingResult(
      data: result.data,
      totalCount: result.count,
    );
  }

  /// プロフィールとそれに紐づくSNSアカウントを全て取得します
  /// [limit] は取得する件数
  /// [offset] は取得する位置
  /// `role`が`admin`の場合は全てのプロフィールを取得できますが、
  /// それ以外の場合は自分のプロフィールしか取得できません
  Future<PagingResult<List<ProfileWithSns>>> fetchProfilesWithSns({
    int limit = 10,
    int offset = 0,
  }) async {
    final result = await _client
        .from('profiles')
        .select()
        .range(offset, offset + limit)
        .count(CountOption.exact)
        .withConverter((e) => e.map(ProfileWithSns.fromJson).toList());

    return PagingResult(
      data: result.data,
      totalCount: result.count,
    );
  }

  /// プロフィールを更新します
  /// [userId] はユーザーID
  /// [name] は名前
  /// [comment] はコメント
  /// [name] と [comment] のどちらか もしくは どちらも指定する必要があります
  /// Nullの場合は更新されません
  /// 明示的に空で更新したい場合は空文字を指定してください
  Future<Profile> updateProfile({
    required String userId,
    String? name,
    String? comment,
  }) async {
    assert(
      name != null || comment != null,
      'name or comment must be provided',
    );
    return _client
        .from('profiles')
        .update({
          if (name != null) 'name': name,
          if (comment != null) 'comment': comment,
        })
        .eq('id', userId)
        .select()
        .single()
        .withConverter(
          Profile.fromJson,
        );
  }

  /// プロフィールのSNSアカウントを全て更新します
  /// [userId] はユーザーID
  /// [snsAccounts] はSNSアカウントのリスト
  /// 既存のSNSアカウント登録を全て削除し、[snsAccounts]を登録します
  Future<void> updateSnsAccounts({
    required String userId,
    required List<ProfileSocialNetworkingService> snsAccounts,
  }) async =>
      _client.rpc<void>(
        'update_sns_accounts',
        params: {
          'user_id': userId,
          'sns_accounts': snsAccounts
              .map((e) => {'type': e.type.name, 'value': e.id})
              .toList(),
        },
      );

  /// プロフィールのアバターを更新する
  /// [avatarData] はバイナリデータ(Uint8List)
  /// [fileExtension] はファイルの拡張子
  /// [userId] はユーザーID
  /// アバターのファイル名は [userId]/avatar となる
  Future<Profile> updateProfileAvatar({
    required Uint8List avatarData,
    required String fileExtension,
    required String userId,
  }) async {
    assert(
      fileExtension == 'png' ||
          fileExtension == 'jpg' ||
          fileExtension == 'jpeg',
      'fileExtension must be png, jpg, or jpeg',
    );
    // バイナリのアップロード
    final path = '$userId/avatar';
    await _client.storage.from('profile_avatars').uploadBinary(
          path,
          avatarData,
          fileOptions: FileOptions(
            contentType: 'image/$fileExtension',
            upsert: true,
          ),
        );

    // データの更新
    return _client
        .from('profiles')
        .update({
          'avatar_name': path,
        })
        .eq('id', userId)
        .select()
        .single()
        .withConverter(Profile.fromJson);
  }

  /// プロフィールのアバターのURLを取得します
  /// [userId] はユーザーID
  /// 当該ファイルが存在するかどうかは検証しないため、URLをFetchしても404が返ることがあります
  String getProfileAvatarUrl(String userId) =>
      _client.storage.from('profile_avatars').getPublicUrl('$userId/avatar');
}

/// ページング用のクラス
/// [data] は取得したデータ
/// [totalCount] は全データ数
class PagingResult<T> {
  PagingResult({
    required this.data,
    required this.totalCount,
  });

  final T data;
  final int totalCount;
}
