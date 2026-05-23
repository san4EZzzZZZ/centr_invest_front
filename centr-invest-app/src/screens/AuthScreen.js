import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

function maskEmail(value) {
  const email = String(value || '').trim();
  if (!email || !email.includes('@')) return '****';

  const [localPart, domainPart] = email.split('@');
  const visiblePart = localPart.slice(0, Math.min(4, localPart.length));
  return `${visiblePart}****@${domainPart}`;
}

function FormAlert({ variant = 'error', message, onClose }) {
  if (!message) return null;

  const isError = variant === 'error';
  const containerStyle = {
    backgroundColor: isError ? '#FFF0EB' : '#E9F8EE',
    borderColor: isError ? '#F23030' : '#26A144',
  };
  const textStyle = { color: isError ? '#F23030' : '#26A144' };

  return (
    <View style={[styles.alertBox, containerStyle]}>
      <Text style={[styles.alertText, textStyle]}>{message}</Text>
      {onClose ? (
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.alertClose, textStyle]}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CheckMark({ width = 14, height = 12, color = '#FFFFFF' }) {
  return (
    <View style={{ position: 'relative', width, height }}>
      <View
        style={{
          position: 'absolute',
          left: Math.round(width * 0.22),
          top: Math.round(height * 0.35),
          width: Math.max(2, Math.round(width * 0.14)),
          height: Math.round(height * 0.58),
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: Math.round(width * 0.62),
          top: Math.round(height * 0),
          width: Math.max(2, Math.round(width * 0.14)),
          height: height,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function AuthCardShell({ children, contentStyle, topSpacer = 0 }) {
  return (
    <View style={styles.shadowWrap}>
      {Platform.OS === 'android' ? (
        <>
          <View pointerEvents="none" style={styles.androidShadowLeftSoft} />
          <View pointerEvents="none" style={styles.androidShadowLeft} />
          <View pointerEvents="none" style={styles.androidShadowRightSoft} />
          <View pointerEvents="none" style={styles.androidShadowRight} />
        </>
      ) : null}

      <View style={Platform.OS === 'ios' ? styles.shadowIOSLeft : null}>
        <View style={Platform.OS === 'ios' ? styles.shadowIOSRight : null}>
          <View className="bg-white rounded-[12px] border border-[#EAEBED] overflow-hidden">
            <View style={[styles.cardContent, contentStyle]}>{children}</View>
          </View>
        </View>
      </View>
    </View>
  );
}

function AuthTabs({ authMode, onSwitch }) {
  return (
    <View style={styles.tabsBlock} className="items-center">
      <View style={{ minWidth: 250 }} className="flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => onSwitch('login')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="px-[2px] justify-center items-center"
        >
          <Text
            style={{
              lineHeight: 20,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
            className={`font-roboto text-[18px] ${authMode === 'login' ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}
          >
            Войти
          </Text>
        </TouchableOpacity>

        <View className="mx-[24px] w-[1px] h-[16px] bg-[#000000]" />

        <TouchableOpacity
          onPress={() => onSwitch('register')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="px-[2px] justify-center items-center"
        >
          <Text
            style={{
              lineHeight: 20,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
            className={`font-roboto text-[18px] ${authMode === 'register' ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}
          >
            Зарегистрироваться
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LoginForm({
  alert,
  fieldErrors,
  loginEmail,
  loginPassword,
  setLoginEmail,
  setLoginPassword,
  clearFieldError,
  onLogin,
  onOpenResetFlow,
  onCloseAlert,
  isSubmitting,
}) {
  return (
    <View>
      <FormAlert variant={alert?.variant} message={alert?.message} onClose={onCloseAlert} />
      <TextInput
        placeholder="Введите Email"
        placeholderTextColor={fieldErrors?.loginEmail ? '#F23030' : '#D6D6D6'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={loginEmail}
        onChangeText={(v) => {
          setLoginEmail(v);
          clearFieldError('loginEmail');
        }}
        onFocus={() => clearFieldError('loginEmail')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.loginEmail ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.loginEmail ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.loginEmail ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.loginEmail}
        </Text>
      ) : null}
      <TextInput
        placeholder="Введите пароль"
        placeholderTextColor={fieldErrors?.loginPassword ? '#F23030' : '#D6D6D6'}
        secureTextEntry
        value={loginPassword}
        onChangeText={(v) => {
          setLoginPassword(v);
          clearFieldError('loginPassword');
        }}
        onFocus={() => clearFieldError('loginPassword')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.loginPassword ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.loginPassword ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.loginPassword ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.loginPassword}
        </Text>
      ) : null}
      <TouchableOpacity disabled={isSubmitting} onPress={onLogin} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center">
        <Text className="font-roboto text-[16px] text-white">{isSubmitting ? 'Вход...' : 'Войти'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onOpenResetFlow} className="items-center pt-[14px] pb-[14px]">
        <Text style={styles.forgotLinkText} className="text-[#F23030] text-[14px] font-robotoLight">
          Забыли пароль?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterForm({
  alert,
  fieldErrors,
  regUsername,
  regEmail,
  regPassword,
  regPassword2,
  regCreator,
  setRegUsername,
  setRegEmail,
  setRegPassword,
  setRegPassword2,
  setRegCreator,
  clearFieldError,
  onRegister,
  onCloseAlert,
  isSubmitting,
}) {
  return (
    <View>
      <FormAlert variant={alert?.variant} message={alert?.message} onClose={onCloseAlert} />

      <TextInput
        placeholder="Имя пользователя"
        placeholderTextColor={fieldErrors?.regUsername ? '#F23030' : '#D6D6D6'}
        value={regUsername}
        onChangeText={(v) => {
          setRegUsername(v);
          clearFieldError('regUsername');
        }}
        onFocus={() => clearFieldError('regUsername')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regUsername ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.regUsername ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.regUsername ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.regUsername}
        </Text>
      ) : null}

      <TextInput
        placeholder="Email"
        placeholderTextColor={fieldErrors?.regEmail ? '#F23030' : '#D6D6D6'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={regEmail}
        onChangeText={(v) => {
          setRegEmail(v);
          clearFieldError('regEmail');
        }}
        onFocus={() => clearFieldError('regEmail')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regEmail ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.regEmail ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.regEmail ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.regEmail}
        </Text>
      ) : null}

      <TextInput
        placeholder="Пароль"
        placeholderTextColor={fieldErrors?.regPassword ? '#F23030' : '#D6D6D6'}
        secureTextEntry
        value={regPassword}
        onChangeText={(v) => {
          setRegPassword(v);
          clearFieldError('regPassword');
        }}
        onFocus={() => clearFieldError('regPassword')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regPassword ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.regPassword ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.regPassword ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.regPassword}
        </Text>
      ) : null}

      <TextInput
        placeholder="Подтверждение пароля"
        placeholderTextColor={fieldErrors?.regPassword2 ? '#F23030' : '#D6D6D6'}
        secureTextEntry
        value={regPassword2}
        onChangeText={(v) => {
          setRegPassword2(v);
          clearFieldError('regPassword2');
        }}
        onFocus={() => clearFieldError('regPassword2')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regPassword2 ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.regPassword2 ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.regPassword2 ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.regPassword2}
        </Text>
      ) : null}

      <TouchableOpacity onPress={() => setRegCreator((prev) => !prev)} activeOpacity={0.8} className="flex-row items-center mb-[10px]">
        <View
          className={`w-[22px] h-[22px] rounded-[6px] items-center justify-center mr-[10px] ${regCreator ? 'bg-[#76113A]' : 'border border-[#76113A] bg-white'}`}
        >
          {regCreator ? <CheckMark width={14} height={12} color="#FFFFFF" /> : null}
        </View>
        <Text className="font-roboto text-[16px] text-[#252525]">Создатель Хайпа</Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={isSubmitting} onPress={onRegister} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center mb-[16px]">
        <Text className="font-roboto text-[16px] text-white">{isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResetRequestScreen({
  alert,
  fieldErrors,
  resetEmail,
  setResetEmail,
  clearFieldError,
  onRequestReset,
  onBackToLogin,
  onSupportPress,
  onCloseAlert,
  isSubmitting,
}) {
  return (
    <View style={styles.resetStepWrap}>
      <Text style={styles.resetTitle} className="font-roboto text-[18px] text-[#000000] text-center mt-[16px]">
        Восстановление доступа
      </Text>
      <FormAlert variant={alert?.variant} message={alert?.message} onClose={onCloseAlert} />
      <TextInput
        placeholder="Email"
        placeholderTextColor={fieldErrors?.resetEmail ? '#F23030' : '#D6D6D6'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={resetEmail}
        onChangeText={(v) => {
          setResetEmail(v);
          clearFieldError('resetEmail');
        }}
        onFocus={() => clearFieldError('resetEmail')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.resetEmail ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.resetEmail ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.resetEmail ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.resetEmail}
        </Text>
      ) : null}
      <TouchableOpacity onPress={onRequestReset} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center">
        <Text className="font-roboto text-[16px] text-white">Восстановить доступ</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBackToLogin} style={styles.backLinkWrap} className="items-center">
        <View style={styles.backLinkRow} className="flex-row items-center">
          <Feather name="arrow-left" size={16} color="#F23030" marginTop={3} style={{ marginRight: 8 }} />
          <Text style={styles.backLinkText} className="text-[#F23030] text-[14px] font-robotoLight mt-[3px]">
            Вернуться к входу
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ResetConfirmScreen({ alert, resetEmail, onSendResetEmail, onBackToLogin, onSupportPress, onCloseAlert }) {
  return (
    <View style={styles.resetStepWrap}>
      <Text style={styles.resetTitle} className="font-roboto text-[14px] text-[#333333] text-center mt-[16px]">
        Подтверждение восстановления{"\n"}доступа
      </Text>
      <FormAlert variant={alert?.variant} message={alert?.message} onClose={onCloseAlert} />
      <Text style={styles.resetMutedText} className="font-roboto text-[14px] text-[#D6D6D6] text-center mb-[15px]">
        Мы нашли аккаунт с почтой
      </Text>
      <Text style={styles.resetEmailText} className="font-roboto text-[14px] text-[#6B6B6B] text-center ">
        {maskEmail(resetEmail)}.
      </Text>
      <Text style={styles.resetBodyText} className="font-roboto text-[14px] text-[#D6D6D6] text-center mt-[15px]">
        Письмо с ссылкой восстановления будет отправлено на эту почту. Если у вас нет{"\n"}доступа к этой почте, пожалуйста,{"\n"}
        {' '}
        <Text onPress={onSupportPress} style={styles.supportLinkText}>
          свяжитесь с поддержкой
        </Text>
        .
      </Text>
      <TouchableOpacity onPress={onSendResetEmail} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center">
        <Text className="font-roboto text-[16px] text-white">Отправить письмо</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBackToLogin} style={styles.backLinkWrap} className="items-center">
        <View style={styles.backLinkRow} className="flex-row items-center">
          <Feather name="arrow-left" size={14} color="#FF4F12" style={{ marginRight: 4 }} />
          <Text style={styles.backLinkText} className="text-[#FF4F12] text-[14px] font-robotoLight">
            Вернуться к входу
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ResetNewPasswordScreen({
  alert,
  fieldErrors,
  resetCode,
  resetNewPassword,
  resetNewPassword2,
  setResetCode,
  setResetNewPassword,
  setResetNewPassword2,
  clearFieldError,
  onSaveNewPassword,
  onBackToLogin,
  onCloseAlert,
}) {
  return (
    <View style={styles.resetStepWrap}>
      <Text style={styles.resetTitle} className="font-roboto text-[18px] text-[#000000] text-center mt-[16px]">
        Восстановление доступа
      </Text>
      <FormAlert variant={alert?.variant} message={alert?.message} onClose={onCloseAlert} />
      <TextInput
        placeholder="Код подтверждения"
        placeholderTextColor={fieldErrors?.resetCode ? '#F23030' : '#D6D6D6'}
        value={resetCode}
        onChangeText={(v) => {
          setResetCode(v);
          clearFieldError('resetCode');
        }}
        onFocus={() => clearFieldError('resetCode')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.resetCode ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.resetCode ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.resetCode ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.resetCode}
        </Text>
      ) : null}
      <TextInput
        placeholder="Новый пароль"
        placeholderTextColor={fieldErrors?.resetNewPassword ? '#F23030' : '#D6D6D6'}
        secureTextEntry
        value={resetNewPassword}
        onChangeText={(v) => {
          setResetNewPassword(v);
          clearFieldError('resetNewPassword');
        }}
        onFocus={() => clearFieldError('resetNewPassword')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.resetNewPassword ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.resetNewPassword ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.resetNewPassword ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.resetNewPassword}
        </Text>
      ) : null}
      <TextInput
        placeholder="Повторите пароль"
        placeholderTextColor={fieldErrors?.resetNewPassword2 ? '#F23030' : '#D6D6D6'}
        secureTextEntry
        value={resetNewPassword2}
        onChangeText={(v) => {
          setResetNewPassword2(v);
          clearFieldError('resetNewPassword2');
        }}
        onFocus={() => clearFieldError('resetNewPassword2')}
        className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.resetNewPassword2 ? 'border-[#F23030]' : 'border-[#EAEBED]'} ${fieldErrors?.resetNewPassword2 ? 'mb-0' : 'mb-[10px]'}`}
      />
      {fieldErrors?.resetNewPassword2 ? (
        <Text style={styles.formErrorText} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">
          {fieldErrors.resetNewPassword2}
        </Text>
      ) : null}
      <TouchableOpacity onPress={onSaveNewPassword} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center">
        <Text className="font-roboto text-[16px] text-white">Сохранить новый пароль</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBackToLogin} style={styles.backLinkWrap} className="items-center">
        <View style={styles.backLinkRow} className="flex-row items-center">
          <Feather name="arrow-left" size={14} color="#FF4F12" style={{ marginRight: 4 }} />
          <Text style={styles.backLinkText} className="text-[#FF4F12] text-[14px] font-robotoLight">
            Вернуться к входу
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ResetSuccessScreen({ onBackToLogin }) {
  return (
    <View className="items-center">
      <Text style={styles.successTitle} className="font-roboto text-[18px] text-[#000000] text-center mt-[16px]">
        Восстановление доступа
      </Text>
      <Text className="font-robotoLight text-[14px] text-[#000000] text-center mb-[10px]">
        Вы успешно изменили пароль
      </Text>
      <View className="w-[68px] h-[68px] rounded-full bg-[#FF9B72] items-center justify-center mb-[10px]">
        <CheckMark width={34} height={30} color="#FFFFFF" />
      </View>
      <TouchableOpacity
        onPress={onBackToLogin}
        className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center"
      >
        <Text className="font-roboto text-[16px] text-white">Вернуться к входу</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResetCard({ authMode, ...props }) {
  const contentStyle =
    authMode === 'reset-success'
      ? styles.successCardContent
      : authMode === 'reset-request'
        ? styles.requestCardContent
        : authMode === 'reset-confirm'
          ? styles.confirmCardContent
          : authMode === 'reset-new'
            ? styles.newPasswordCardContent
            : styles.resetCardContent;

  return (
    <AuthCardShell contentStyle={contentStyle}>
      {authMode === 'reset-request' ? <ResetRequestScreen {...props} /> : null}
      {authMode === 'reset-confirm' ? <ResetConfirmScreen {...props} /> : null}
      {authMode === 'reset-new' ? <ResetNewPasswordScreen {...props} /> : null}
      {authMode === 'reset-success' ? <ResetSuccessScreen {...props} /> : null}
    </AuthCardShell>
  );
}

export default function AuthScreen({
  authMode,
  alert,
  fieldErrors,
  loginEmail,
  loginPassword,
  setLoginEmail,
  setLoginPassword,
  regUsername,
  regEmail,
  regPassword,
  regPassword2,
  regCreator,
  setRegUsername,
  setRegEmail,
  setRegPassword,
  setRegPassword2,
  setRegCreator,
  resetEmail,
  resetCode,
  resetNewPassword,
  resetNewPassword2,
  setResetEmail,
  setResetCode,
  setResetNewPassword,
  setResetNewPassword2,
  clearFieldError,
  onSwitch,
  onOpenResetFlow,
  onBackToLogin,
  onLogin,
  onRegister,
  onRequestReset,
  onSendResetEmail,
  onSaveNewPassword,
  onSupportPress,
  onCloseAlert,
  isSubmitting,
}) {
  const isResetFlow = authMode.startsWith('reset-');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-[16px] pb-10 items-center">
            {isResetFlow ? (
              <>
                <View style={{ height: 246 }} />
                <ResetCard
                  authMode={authMode}
                  alert={alert}
                  fieldErrors={fieldErrors}
                  resetEmail={resetEmail}
                  resetCode={resetCode}
                  resetNewPassword={resetNewPassword}
                  resetNewPassword2={resetNewPassword2}
                  setResetEmail={setResetEmail}
                  setResetCode={setResetCode}
                  setResetNewPassword={setResetNewPassword}
                  setResetNewPassword2={setResetNewPassword2}
                  clearFieldError={clearFieldError}
                  onRequestReset={onRequestReset}
                  onSendResetEmail={onSendResetEmail}
                  onSaveNewPassword={onSaveNewPassword}
                  onBackToLogin={onBackToLogin}
                  onSupportPress={onSupportPress}
                  onCloseAlert={onCloseAlert}
                />
              </>
            ) : (
              <>
                <View style={{ width: 190, height: 67 }} className="mt-[242.5px] self-center items-center justify-center flex-row">
                  <View className="w-8 h-10 bg-[#7700FF] rounded-tr-xl rounded-bl-xl mr-2" />
                  <Text className="text-2xl font-bold text-[#182030]">Тест</Text>
                </View>

                <AuthCardShell contentStyle={styles.mainCardContent}>
                  <AuthTabs authMode={authMode} onSwitch={onSwitch} />
                  <View>
                    {authMode === 'login' ? (
                      <LoginForm
                        alert={alert}
                        fieldErrors={fieldErrors}
                        loginEmail={loginEmail}
                        loginPassword={loginPassword}
                        setLoginEmail={setLoginEmail}
                        setLoginPassword={setLoginPassword}
                        clearFieldError={clearFieldError}
                        onLogin={onLogin}
                        onOpenResetFlow={onOpenResetFlow}
                        onCloseAlert={onCloseAlert}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <RegisterForm
                        alert={alert}
                        fieldErrors={fieldErrors}
                        regUsername={regUsername}
                        regEmail={regEmail}
                        regPassword={regPassword}
                        regPassword2={regPassword2}
                        regCreator={regCreator}
                        setRegUsername={setRegUsername}
                        setRegEmail={setRegEmail}
                        setRegPassword={setRegPassword}
                        setRegPassword2={setRegPassword2}
                        setRegCreator={setRegCreator}
                        clearFieldError={clearFieldError}
                        onRegister={onRegister}
                        onCloseAlert={onCloseAlert}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </View>
                </AuthCardShell>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginTop: 20,
    width: '100%',
    maxWidth: 370,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
      web: {
        boxShadow: '-6px 10px 14px 0px rgba(242, 239, 255, 0.45), 6px 10px 12px 0px rgba(242, 239, 255, 0.45)',
      },
    }),
  },
  shadowIOSLeft: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#F2EFFF',
        shadowOffset: { width: -6, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      default: {},
    }),
  },
  shadowIOSRight: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#F2EFFF',
        shadowOffset: { width: 6, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      default: {},
    }),
  },
  androidShadowLeftSoft: {
    position: 'absolute',
    left: -14,
    top: 12,
    right: 0,
    bottom: -10,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 239, 255, 0.18)',
  },
  androidShadowLeft: {
    position: 'absolute',
    left: -6,
    top: 10,
    right: 0,
    bottom: -6,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 239, 255, 0.28)',
  },
  androidShadowRightSoft: {
    position: 'absolute',
    left: 14,
    top: 12,
    right: -14,
    bottom: -10,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 239, 255, 0.18)',
  },
  androidShadowRight: {
    position: 'absolute',
    left: 6,
    top: 10,
    right: -6,
    bottom: -6,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 239, 255, 0.28)',
  },
  cardContent: {
    paddingTop: 15,
    paddingBottom: 0,
    paddingHorizontal: 16,
    rowGap: 10,
    minHeight: 281,
  },
  mainCardContent: {
    minHeight: 281,
    paddingTop: 15,
    paddingBottom: 0,
  },
  resetCardContent: {
    minHeight: 346,
    paddingTop: 0,
    paddingBottom: 16,
  },
  newPasswordCardContent: {
    minHeight: 346,
    paddingTop: 0,
    paddingBottom: 16,
  },
  confirmCardContent: {
    minHeight: 0,
    paddingTop: 0,
    paddingBottom: 16,
  },
  requestCardContent: {
    minHeight: 215,
    paddingTop: 0,
    paddingBottom: 16,
  },
  successCardContent: {
    minHeight: 223,
    paddingTop: 0,
    paddingBottom: 16,
  },
  tabsBlock: {
    marginTop: 0,
  },
  alertBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    marginTop: 0,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  alertText: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  alertClose: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    lineHeight: 22,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  formErrorText: {
    lineHeight: 22,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  resetTitle: {
    lineHeight: 22,
    marginBottom: 16,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  successTitle: {
    lineHeight: 22,
    marginBottom: 16,
  },
  resetMutedText: {
    lineHeight: 26,
    marginTop: 2,
  },
  resetEmailText: {
    lineHeight: 26,
    marginTop: 2,
    marginBottom: 10,
  },
  resetBodyText: {
    lineHeight: 24,
    marginBottom: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  supportLinkText: {
    color: '#FF5D2E',
    textDecorationLine: 'underline',
  },
  backLinkRow: {
    height: 22,
    alignItems: 'center',
  },
  backLinkWrap: {
    marginTop: 10,
    marginBottom: 0,
  },
  backLinkText: {
    includeFontPadding: false,
  },
  resetStepWrap: {},
  forgotLinkText: {
    lineHeight: 22,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
