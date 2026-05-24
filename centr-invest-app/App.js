import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { NativeWindStyleSheet } from 'nativewind';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import { authApi, clearToken, setToken } from './src/api/client';

NativeWindStyleSheet.setOutput({
  default: "native",
});

SplashScreen.preventAutoHideAsync();

const TEST_ACCOUNT = {
  email: 'admin@example.com',
  password: 'admin123',
};

function isValidEmail(value) {
  if (!value) return false;
  const v = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function toAppUser(user) {
  return {
    ...user,
    name: user?.username ?? user?.email ?? 'Пользователь',
    roleCode: user?.role,
    role: user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь',
  };
}

function normalizeAppUser(user) {
  const roleTitle =
    user?.role === 'SUPER_ADMIN'
      ? 'Супер-администратор'
      : user?.role === 'ADMIN'
        ? 'Администратор'
        : 'Пользователь';

  return {
    ...user,
    name: user?.username ?? user?.email ?? 'Пользователь',
    roleCode: user?.role,
    role: roleTitle,
  };
}

export default function App() {
  const [authMode, setAuthMode] = useState('login');
  const [fontsLoaded] = useFonts({ Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alert, setAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginEmail, setLoginEmail] = useState(TEST_ACCOUNT.email);
  const [loginPassword, setLoginPassword] = useState(TEST_ACCOUNT.password);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regCode, setRegCode] = useState('');

  const [resetEmail, setResetEmail] = useState(TEST_ACCOUNT.email);
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewPassword2, setResetNewPassword2] = useState('');

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  function resetFormErrors() {
    setAlert(null);
    setFieldErrors({});
  }

  function setFieldError(field, message) {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev?.[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSwitch(mode) {
    setAuthMode(mode);
    resetFormErrors();
  }

  function handleOpenResetFlow() {
    setResetEmail(loginEmail || TEST_ACCOUNT.email);
    setResetCode('');
    setResetNewPassword('');
    setResetNewPassword2('');
    setAuthMode('reset-request');
    resetFormErrors();
  }

  async function handleLogin() {
    resetFormErrors();

    const email = String(loginEmail || '').trim();
    const password = String(loginPassword || '');

    if (!email) {
      setFieldError('loginEmail', 'Введите Email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('loginEmail', 'Некорректный формат Email');
      return;
    }

    if (!password) {
      setFieldError('loginPassword', 'Введите пароль');
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = await authApi.login(email, password);
      setToken(auth.token);
      setCurrentUser(normalizeAppUser(auth.user));
      setAlert({ variant: 'success', message: 'Успешный вход' });
      setIsLoggedIn(true);
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Invalid email or password') || msg.includes('Unauthorized') || msg.includes('401')) {
        setFieldError('loginPassword', 'Неверный email или пароль');
      } else {
        setFieldError('loginPassword', 'Не удалось войти. Попробуйте снова.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister() {
    resetFormErrors();

    const username = String(regUsername || '').trim();
    const email = String(regEmail || '').trim();
    const password = String(regPassword || '');
    const password2 = String(regPassword2 || '');

    if (!username || !email || !password || !password2) {
      if (!username) setFieldError('regUsername', ' ');
      if (!email) setFieldError('regEmail', ' ');
      if (!password) setFieldError('regPassword', ' ');
      setFieldError('regPassword2', 'Заполните все поля');
      return;
    }

    if (email && !isValidEmail(email)) setFieldError('regEmail', 'Некорректный формат Email');
    if (password && password.length < 8) setFieldError('regPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('regPassword2', 'Пароли не совпадают');

    const shouldFail =
      (email && !isValidEmail(email)) ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (shouldFail) return;

    setIsSubmitting(true);
    try {
      const auth = await authApi.register({ email, username, password });
      setToken(auth.token);
      setCurrentUser(normalizeAppUser(auth.user));
      setAlert({ variant: 'success', message: 'Регистрация успешна' });
      setIsLoggedIn(true);
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Email is already registered') || msg.includes('409') || msg.includes('exists')) {
        setFieldError('regEmail', 'Этот Email уже зарегистрирован');
      } else {
        setAlert({ variant: 'error', message: 'Не удалось зарегистрироваться. Попробуйте снова.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterV2() {
    resetFormErrors();

    const username = String(regUsername || '').trim();
    const email = String(regEmail || '').trim();
    const password = String(regPassword || '');
    const password2 = String(regPassword2 || '');

    if (!username || !email || !password || !password2) {
      if (!username) setFieldError('regUsername', ' ');
      if (!email) setFieldError('regEmail', ' ');
      if (!password) setFieldError('regPassword', ' ');
      setFieldError('regPassword2', 'Заполните все поля');
      return;
    }

    if (email && !isValidEmail(email)) setFieldError('regEmail', 'Некорректный формат Email');
    if (password && password.length < 8) setFieldError('regPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('regPassword2', 'Пароли не совпадают');

    const shouldFail =
      (email && !isValidEmail(email)) ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (shouldFail) return;

    setIsSubmitting(true);
    try {
      // Предварительная попытка регистрации для проверки email
      await authApi.register({ email, username, password });
      setRegEmail(email);
      setRegCode('');
      setAuthMode('register-code');
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Email is already registered') || msg.includes('409') || msg.includes('exists')) {
        setFieldError('regEmail', ' ');
        // Используем специальный префикс, чтобы в UI знать, что обводка не нужна
        setFieldError('regPassword2', 'NO_BORDER:Этот Email уже зарегистрирован');
      } else {
        setAlert({ variant: 'error', message: 'Не удалось продолжить. Попробуйте снова.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendRegisterCode() {
    const email = String(regEmail || '').trim();
    const username = String(regUsername || '').trim();
    const password = String(regPassword || '');

    setIsSubmitting(true);
    try {
      await authApi.register({ email, username, password });
      setAuthMode('register-code');
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Email is already registered') || msg.includes('409') || msg.includes('exists')) {
        setFieldError('regEmail', ' ');
        setFieldError('regPassword2', 'NO_BORDER:Этот Email уже зарегистрирован');
        setAuthMode('register');
      } else {
        setAlert({ variant: 'error', message: error.message || 'Не удалось зарегистрироваться. Попробуйте снова.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmRegister() {
    resetFormErrors();

    const email = String(regEmail || '').trim();
    const code = String(regCode || '').trim();

    if (!email) setFieldError('regEmail', 'Введите Email');
    if (!code) setFieldError('regCode', 'Введите код подтверждения');
    if (!email || !code) return;

    setIsSubmitting(true);
    try {
      await authApi.confirmRegistration({ email, code });
      setAlert(null);
      setAuthMode('register-success');
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Invalid confirmation code')) {
        setFieldError('regCode', 'Неверный код подтверждения');
      } else {
        setAlert({ variant: 'error', message: error.message || 'Не удалось подтвердить регистрацию' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRequestReset() {
    resetFormErrors();

    const email = String(resetEmail || '').trim();
    if (!email) {
      setFieldError('resetEmail', 'Введите Email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('resetEmail', 'Некорректный формат Email');
      return;
    }

    setResetEmail(email);
    setAuthMode('reset-confirm');
  }

  function handleSendResetEmail() {
    resetFormErrors();
    setAuthMode('reset-new');
  }

  function handleSaveNewPassword() {
    resetFormErrors();

    const code = String(resetCode || '').trim();
    const password = String(resetNewPassword || '');
    const password2 = String(resetNewPassword2 || '');

    if (!code) setFieldError('resetCode', 'Введите код подтверждения');
    if (!password) setFieldError('resetNewPassword', 'Введите пароль');
    if (!password2) setFieldError('resetNewPassword2', 'Повторите пароль');
    if (password && password.length < 8) setFieldError('resetNewPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('resetNewPassword2', 'Пароли не совпадают');

    const shouldFail =
      !code ||
      !password ||
      !password2 ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (shouldFail) return;

    setAuthMode('reset-success');
  }

  function handleBackToLogin() {
    setAuthMode('login');
    resetFormErrors();
  }

  function handleLogout() {
    clearToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAlert(null);
    setAuthMode('login');
    setLoginEmail(TEST_ACCOUNT.email);
    setLoginPassword(TEST_ACCOUNT.password);
  }

  function handleSupportPress() {
    // no-op: password reset is not part of the backend API yet.
  }

  async function handleRequestResetV2() {
    resetFormErrors();

    const email = String(resetEmail || '').trim();
    if (!email) {
      setFieldError('resetEmail', 'Введите Email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('resetEmail', 'Некорректный формат Email');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setResetEmail(email);
      setAuthMode('reset-confirm');
    } catch (error) {
      setAlert({ variant: 'error', message: error.message || 'Не удалось отправить код восстановления' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveNewPasswordV2() {
    resetFormErrors();

    const code = String(resetCode || '').trim();
    const password = String(resetNewPassword || '');
    const password2 = String(resetNewPassword2 || '');

    if (!code) setFieldError('resetCode', 'Введите код подтверждения');
    if (!password) setFieldError('resetNewPassword', 'Введите пароль');
    if (!password2) setFieldError('resetNewPassword2', 'Повторите пароль');
    if (password && password.length < 8) setFieldError('resetNewPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('resetNewPassword2', 'Пароли не совпадают');

    const shouldFail =
      !code ||
      !password ||
      !password2 ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (shouldFail) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        email: String(resetEmail || '').trim(),
        code,
        newPassword: password,
      });
      setAuthMode('reset-success');
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('Invalid confirmation code')) {
        setFieldError('resetCode', 'Неверный код подтверждения');
      } else {
        setAlert({ variant: 'error', message: error.message || 'Не удалось изменить пароль' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogoutV2() {
    try {
      await authApi.logout();
    } catch {
      // Local logout should still work if the session is already expired.
    }

    handleLogout();
  }

  if (!fontsLoaded) return null;

  if (isLoggedIn) {
    return (
      <SafeAreaProvider>
        <HomeScreen currentUser={currentUser} onLogout={handleLogoutV2} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthScreen
        authMode={authMode}
        alert={alert}
        fieldErrors={fieldErrors}
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        setLoginEmail={setLoginEmail}
        setLoginPassword={setLoginPassword}
        regUsername={regUsername}
        regEmail={regEmail}
        regPassword={regPassword}
        regPassword2={regPassword2}
        regCode={regCode}
        setRegUsername={setRegUsername}
        setRegEmail={setRegEmail}
        setRegPassword={setRegPassword}
        setRegPassword2={setRegPassword2}
        setRegCode={setRegCode}
        resetEmail={resetEmail}
        resetCode={resetCode}
        resetNewPassword={resetNewPassword}
        resetNewPassword2={resetNewPassword2}
        setResetEmail={setResetEmail}
        setResetCode={setResetCode}
        setResetNewPassword={setResetNewPassword}
        setResetNewPassword2={setResetNewPassword2}
        clearFieldError={clearFieldError}
        onSwitch={handleSwitch}
        onOpenResetFlow={handleOpenResetFlow}
        onBackToLogin={handleBackToLogin}
        onLogin={handleLogin}
        onRegister={handleRegisterV2}
        onSendRegisterCode={handleSendRegisterCode}
        onConfirmRegister={handleConfirmRegister}
        onRequestReset={handleRequestResetV2}
        onSendResetEmail={handleSendResetEmail}
        onSaveNewPassword={handleSaveNewPasswordV2}
        onSupportPress={handleSupportPress}
        onCloseAlert={() => setAlert(null)}
        isSubmitting={isSubmitting}
      />
    </SafeAreaProvider>
  );
}
