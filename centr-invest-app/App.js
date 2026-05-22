import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Roboto_400Regular, Roboto_300Light } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './src/screens/HomeScreen';

SplashScreen.preventAutoHideAsync();

const TEST_ACCOUNT = {
  email: 'test@centrinvest.app',
  password: 'CentrInvest#2026',
};

function isValidEmail(value) {
  if (!value) return false;
  const v = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function FormAlert({ variant = 'error', message, onClose }) {
  if (!message) return null;

  const isError = variant === 'error';
  const containerStyle = {
    backgroundColor: isError ? '#FFF0EB' : '#E9F8EE',
    borderColor: isError ? '#FF4F12' : '#26A144',
  };
  const textStyle = { color: isError ? '#FF4F12' : '#26A144' };

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

export default function App() {
  const [isLogin, setIsLogin] = useState(true); // По умолчанию показываем форму входа
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_300Light });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [alert, setAlert] = useState(null); // { variant: 'error' | 'success', message: string }
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginEmail, setLoginEmail] = useState(TEST_ACCOUNT.email);
  const [loginPassword, setLoginPassword] = useState(TEST_ACCOUNT.password);

  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');

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

  function handleSwitch(modeIsLogin) {
    setIsLogin(modeIsLogin);
    resetFormErrors();
  }

  function handleLogin() {
    resetFormErrors();

    const email = String(loginEmail || '').trim();
    const password = String(loginPassword || '');

    if (!email) {
      setFieldError('loginEmail', 'Введите Email');
      setAlert({ variant: 'error', message: 'Введите Email' });
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('loginEmail', 'Некорректный Email');
      setAlert({ variant: 'error', message: 'Некорректный Email' });
      return;
    }

    if (!password) {
      setFieldError('loginPassword', 'Введите пароль');
      setAlert({ variant: 'error', message: 'Введите пароль' });
      return;
    }

    if (email.toLowerCase() !== TEST_ACCOUNT.email.toLowerCase()) {
      setFieldError('loginEmail', 'Пользователь не найден');
      setAlert({ variant: 'error', message: 'Пользователь не найден' });
      return;
    }

    if (password !== TEST_ACCOUNT.password) {
      setFieldError('loginPassword', 'Неверный пароль');
      setAlert({ variant: 'error', message: 'Неверный пароль' });
      return;
    }

    setAlert({ variant: 'success', message: 'Успешный вход' });
    setIsLoggedIn(true);
  }

  function handleRegister() {
    resetFormErrors();

    const lastName = String(regLastName || '').trim();
    const firstName = String(regFirstName || '').trim();
    const phone = String(regPhone || '').trim();
    const email = String(regEmail || '').trim();
    const password = String(regPassword || '');
    const password2 = String(regPassword2 || '');

    if (!lastName) setFieldError('regLastName', 'Введите фамилию');
    if (!firstName) setFieldError('regFirstName', 'Введите имя');
    if (!phone) setFieldError('regPhone', 'Введите телефон');
    if (!email) setFieldError('regEmail', 'Введите Email');
    if (email && !isValidEmail(email)) setFieldError('regEmail', 'Некорректный Email');
    if (!password) setFieldError('regPassword', 'Введите пароль');
    if (!password2) setFieldError('regPassword2', 'Подтвердите пароль');
    if (password && password.length < 8) setFieldError('regPassword', 'Пароль должен быть не короче 8 символов');
    if (password && password2 && password !== password2) setFieldError('regPassword2', 'Пароли не совпадают');

    const hasAnyError = Object.keys(fieldErrors).length > 0;
    // fieldErrors обновляются асинхронно — проверим вручную теми же условиями
    const shouldFail =
      !lastName ||
      !firstName ||
      !phone ||
      !email ||
      (email && !isValidEmail(email)) ||
      !password ||
      !password2 ||
      (password && password.length < 8) ||
      (password && password2 && password !== password2);

    if (hasAnyError || shouldFail) {
      setAlert({ variant: 'error', message: 'Проверьте поля формы' });
      return;
    }

    setAlert({ variant: 'success', message: 'Регистрация (демо) успешна. Теперь можно войти.' });
    setIsLogin(true);
  }

  if (!fontsLoaded) return null;
  else SplashScreen.hideAsync();

  return (
    <SafeAreaProvider>
      {isLoggedIn ? (
        <HomeScreen />
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 px-[16px] pb-10 items-center">
              
              {/* Логотип (190x67, mt 13px) */}
              <View style={{ width: 190, height: 67 }} className="mt-[242.5px] self-center items-center justify-center flex-row">
                <View className="w-8 h-10 bg-[#7700FF] rounded-tr-xl rounded-bl-xl mr-2" />
                <Text className="text-2xl font-bold text-[#182030]">Тест</Text>
              </View>

              {/* ОБЩИЙ БОКС */}
              <View style={styles.shadowContainer}>
                <View className="bg-white rounded-[12px] border border-[#EAEBED] overflow-hidden">
                  <View style={styles.cardContent}>
                  
              {/* ТАБЫ: Исправленное центрирование без обрезки */}
              <View style={styles.tabsBlock} className="items-center">
                <View 
                  style={{ minWidth: 250 }} // Используем minWidth вместо жесткого width
                  className="flex-row items-center justify-center"
                >
                  {/* Кнопка Войти */}
                  <TouchableOpacity 
                    onPress={() => handleSwitch(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="px-[2px] justify-center items-center"
                  >
                    <Text 
                      style={{ 
                        lineHeight: 20, // Явно задаем высоту строки
                        includeFontPadding: false, // Убираем системные отступы Android
                        textAlignVertical: 'center' 
                      }} 
                      className={`font-roboto text-[18px] ${isLogin ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}
                    >
                      Войти
                    </Text>
                  </TouchableOpacity>

                  {/* Палочка: Высота 16, Отступы по 24 */}
                  <View className="mx-[24px] w-[1px] h-[16px] bg-[#000000]" />

                  {/* Кнопка Зарегистрироваться */}
                  <TouchableOpacity 
                    onPress={() => handleSwitch(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="px-[2px] justify-center items-center"
                  >
                    <Text 
                      style={{ 
                        lineHeight: 20, 
                        includeFontPadding: false, 
                        textAlignVertical: 'center' 
                      }} 
                      className={`font-roboto text-[18px] ${!isLogin ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}
                    >
                      Зарегистрироваться
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

                  {/* КОНТЕНТ ФОРМЫ */}
                  <View>
                    
                    {isLogin ? (
                      /* --- ФОРМА ВХОДА --- */
                      <View>
                        <FormAlert
                          variant={alert?.variant}
                          message={alert?.message}
                          onClose={() => setAlert(null)}
                        />
                        <TextInput 
                          placeholder="Введите Email" 
                          placeholderTextColor={fieldErrors?.loginEmail ? '#FF4F12' : '#D6D6D6'}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={loginEmail}
                          onChangeText={(v) => {
                            setLoginEmail(v);
                            clearFieldError('loginEmail');
                          }}
                          onFocus={() => clearFieldError('loginEmail')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.loginEmail ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.loginEmail ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.loginEmail}</Text>
                        ) : null}
                        <TextInput 
                          placeholder="Введите пароль" 
                          placeholderTextColor={fieldErrors?.loginPassword ? '#FF4F12' : '#D6D6D6'}
                          secureTextEntry
                          value={loginPassword}
                          onChangeText={(v) => {
                            setLoginPassword(v);
                            clearFieldError('loginPassword');
                          }}
                          onFocus={() => clearFieldError('loginPassword')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.loginPassword ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.loginPassword ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.loginPassword}</Text>
                        ) : null}
                        <TouchableOpacity
                          onPress={handleLogin}
                          className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center"
                        >
                          <Text className="font-roboto text-[16px] text-white font-medium">Войти</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center pt-[16px]">
                          <Text className="text-[#FF4F12] text-[14px] underline font-robotoLight">Забыли пароль?</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* --- ФОРМА РЕГИСТРАЦИИ --- */
                      <View>
                        <FormAlert
                          variant={alert?.variant}
                          message={alert?.message}
                          onClose={() => setAlert(null)}
                        />
                        <TextInput
                          placeholder="Иванов"
                          placeholderTextColor={fieldErrors?.regLastName ? '#FF4F12' : '#D6D6D6'}
                          value={regLastName}
                          onChangeText={(v) => {
                            setRegLastName(v);
                            clearFieldError('regLastName');
                          }}
                          onFocus={() => clearFieldError('regLastName')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regLastName ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regLastName ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regLastName}</Text>
                        ) : null}
                        
                        <TextInput
                          placeholder="Иван"
                          placeholderTextColor={fieldErrors?.regFirstName ? '#FF4F12' : '#D6D6D6'}
                          value={regFirstName}
                          onChangeText={(v) => {
                            setRegFirstName(v);
                            clearFieldError('regFirstName');
                          }}
                          onFocus={() => clearFieldError('regFirstName')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regFirstName ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regFirstName ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regFirstName}</Text>
                        ) : null}
                        
                        <TextInput
                          placeholder="Иванович"
                          placeholderTextColor="#D6D6D6"
                          value={regMiddleName}
                          onChangeText={setRegMiddleName}
                          className="w-full h-[56px] border border-[#EAEBED] px-[16px] rounded-[8px] font-roboto text-[16px] mb-[10px]"
                        />
                        
                        <TextInput
                          placeholder="+7 (999) 99-99-999"
                          placeholderTextColor={fieldErrors?.regPhone ? '#FF4F12' : '#D6D6D6'}
                          keyboardType="phone-pad"
                          value={regPhone}
                          onChangeText={(v) => {
                            setRegPhone(v);
                            clearFieldError('regPhone');
                          }}
                          onFocus={() => clearFieldError('regPhone')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regPhone ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regPhone ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regPhone}</Text>
                        ) : null}
                        
                        <TextInput
                          placeholder="testmail@yandex.ru"
                          placeholderTextColor={fieldErrors?.regEmail ? '#FF4F12' : '#D6D6D6'}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={regEmail}
                          onChangeText={(v) => {
                            setRegEmail(v);
                            clearFieldError('regEmail');
                          }}
                          onFocus={() => clearFieldError('regEmail')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regEmail ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regEmail ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regEmail}</Text>
                        ) : null}
                        
                        <TextInput
                          placeholder="Пароль"
                          placeholderTextColor={fieldErrors?.regPassword ? '#FF4F12' : '#D6D6D6'}
                          secureTextEntry
                          value={regPassword}
                          onChangeText={(v) => {
                            setRegPassword(v);
                            clearFieldError('regPassword');
                          }}
                          onFocus={() => clearFieldError('regPassword')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regPassword ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regPassword ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regPassword}</Text>
                        ) : null}
                        
                        <TextInput
                          placeholder="Подтверждение пароля"
                          placeholderTextColor={fieldErrors?.regPassword2 ? '#FF4F12' : '#D6D6D6'}
                          secureTextEntry
                          value={regPassword2}
                          onChangeText={(v) => {
                            setRegPassword2(v);
                            clearFieldError('regPassword2');
                          }}
                          onFocus={() => clearFieldError('regPassword2')}
                          className={`w-full h-[56px] border px-[16px] rounded-[8px] font-roboto text-[16px] ${fieldErrors?.regPassword2 ? 'border-[#FF4F12]' : 'border-[#EAEBED]'} mb-[6px]`}
                        />
                        {fieldErrors?.regPassword2 ? (
                          <Text className="text-[#FF4F12] text-[14px] font-robotoLight mb-[6px]">{fieldErrors.regPassword2}</Text>
                        ) : null}

                        <TouchableOpacity onPress={handleRegister} className="bg-[#7700FF] w-full h-[56px] rounded-[8px] items-center justify-center mb-[16px]">
                          <Text className="font-roboto text-[16px] text-white font-medium">Зарегистрироваться</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  </View>
                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 370,
    ...Platform.select({
      ios: {
        shadowColor: '#F2EFFF',
        shadowOffset: { width: -6, height: 6 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '-6px 6px 5px 0px rgba(242, 239, 255, 0.75)',
      }
    }),
  },
  cardContent: {
    paddingTop: 15,
    paddingBottom: 16,
    paddingHorizontal: 16,
    rowGap: 10,
    minHeight: 281,
  },
  tabsBlock: {
    marginTop: 0,
  },
  alertBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  alertText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
  },
  alertClose: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 18,
  },
});
