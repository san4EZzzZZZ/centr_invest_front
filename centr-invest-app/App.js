import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import { QUIZZES, cloneQuiz } from './src/data/quizzes';

SplashScreen.preventAutoHideAsync();

const TEST_ACCOUNT = {
  email: 'test@centrinvest.app',
  password: 'CentrInvest#2026',
};

const ADMIN_ACCOUNT = {
  email: 'admin@centrinvest.app',
  password: 'Admin#2026',
  name: 'Admin',
  role: 'Администратор',
};

const TEST_ACCOUNTS = [
  {
    ...TEST_ACCOUNT,
    name: 'User',
    role: 'Пользователь',
  },
  ADMIN_ACCOUNT,
];

function isValidEmail(value) {
  if (!value) return false;
  const v = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function App() {
  const [authMode, setAuthMode] = useState('login');
  const [fontsLoaded] = useFonts({ Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [quizzes, setQuizzes] = useState(() => QUIZZES.map((quiz) => ({ ...cloneQuiz(quiz), status: quiz.status ?? 'published' })));

  const [alert, setAlert] = useState(null); // { variant: 'error' | 'success', message: string }
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginEmail, setLoginEmail] = useState(TEST_ACCOUNT.email);
  const [loginPassword, setLoginPassword] = useState(TEST_ACCOUNT.password);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regCreator, setRegCreator] = useState(true);

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

  function handleLogin() {
    resetFormErrors();

    const email = String(loginEmail || '').trim();
    const password = String(loginPassword || '');

    if (!email) {
      setFieldError('loginEmail', 'Введите Email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('loginEmail', 'Некорректный Email');
      return;
    }

    if (!password) {
      setFieldError('loginPassword', 'Введите пароль');
      return;
    }

    const matchedAccount = TEST_ACCOUNTS.find((account) => account.email.toLowerCase() === email.toLowerCase());

    if (!matchedAccount) {
      setFieldError('loginPassword', 'Пользователь не найден');
      return;
    }

    if (password !== matchedAccount.password) {
      setFieldError('loginPassword', 'Неверный пароль');
      return;
    }

    setAlert({ variant: 'success', message: 'Успешный вход' });
    setIsLoggedIn(true);
    setCurrentUser({
      email: matchedAccount.email,
      name: matchedAccount.name,
      role: matchedAccount.role,
    });
  }

  function handleRegister() {
    resetFormErrors();

    const username = String(regUsername || '').trim();
    const email = String(regEmail || '').trim();
    const password = String(regPassword || '');
    const password2 = String(regPassword2 || '');

    if (!username) setFieldError('regUsername', 'Введите имя пользователя');
    if (!email) setFieldError('regEmail', 'Введите Email');
    if (email && !isValidEmail(email)) setFieldError('regEmail', 'Некорректный Email');
    if (!password) setFieldError('regPassword', 'Введите пароль');
    if (!password2) setFieldError('regPassword2', 'Подтвердите пароль');
    if (password && password.length < 8) setFieldError('regPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('regPassword2', 'Пароли не совпадают');

    const shouldFail =
      !username ||
      !email ||
      (email && !isValidEmail(email)) ||
      !password ||
      !password2 ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (shouldFail) {
      return;
    }

    setAlert({ variant: 'success', message: 'Регистрация (демо) успешна. Теперь можно войти.' });
    setAuthMode('login');
  }

  function handleRequestReset() {
    resetFormErrors();

    const email = String(resetEmail || '').trim();
    if (!email) {
      setFieldError('resetEmail', 'Введите Email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('resetEmail', 'Некорректный Email');
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

    if (shouldFail) {
      return;
    }

    setAuthMode('reset-success');
  }

  function handleBackToLogin() {
    setAuthMode('login');
    resetFormErrors();
  }

  function handleSupportPress() {
    // no-op (demo UI)
  }

  if (!fontsLoaded) return null;

  if (isLoggedIn) {
    return (
      <SafeAreaProvider>
        <HomeScreen
          currentUser={currentUser}
          quizzes={quizzes}
          setQuizzes={setQuizzes}
          onLogout={() => {
            setIsLoggedIn(false);
            setCurrentUser(null);
            setAlert(null);
            setAuthMode('login');
            setLoginEmail(TEST_ACCOUNT.email);
            setLoginPassword(TEST_ACCOUNT.password);
          }}
        />
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
        regCreator={regCreator}
        setRegUsername={setRegUsername}
        setRegEmail={setRegEmail}
        setRegPassword={setRegPassword}
        setRegPassword2={setRegPassword2}
        setRegCreator={setRegCreator}
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
        onRegister={handleRegister}
        onRequestReset={handleRequestReset}
        onSendResetEmail={handleSendResetEmail}
        onSaveNewPassword={handleSaveNewPassword}
        onSupportPress={handleSupportPress}
        onCloseAlert={() => setAlert(null)}
      />
    </SafeAreaProvider>
  );
}
