import { FirebaseError } from 'firebase/app'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email':            'Geçersiz e-posta adresi.',
  'auth/user-not-found':           'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
  'auth/wrong-password':           'Şifre hatalı. Lütfen tekrar deneyin.',
  'auth/invalid-credential':       'E-posta veya şifre hatalı.',
  'auth/email-already-in-use':     'Bu e-posta adresi zaten kullanımda.',
  'auth/weak-password':            'Şifre en az 6 karakter olmalıdır.',
  'auth/popup-closed-by-user':     'Giriş penceresi kapatıldı. Lütfen tekrar deneyin.',
  'auth/popup-blocked':            'Açılır pencere engellendi. Tarayıcı izinlerini kontrol edin.',
  'auth/cancelled-popup-request':  'Giriş isteği iptal edildi.',
  'auth/network-request-failed':   'Ağ hatası. İnternet bağlantınızı kontrol edin.',
  'auth/too-many-requests':        'Çok fazla başarısız deneme. Bir süre bekleyin.',
  'auth/user-disabled':            'Bu hesap devre dışı bırakılmış.',
  'auth/requires-recent-login':    'Bu işlem için yeniden giriş yapmanız gerekiyor.',
  'auth/account-exists-with-different-credential':
    'Bu e-posta farklı bir yöntemle kayıtlı. Diğer giriş yöntemini deneyin.',
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] ?? `Bir hata oluştu: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
}
