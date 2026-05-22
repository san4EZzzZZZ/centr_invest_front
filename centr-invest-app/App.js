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

export default function App() {
  const [isLogin, setIsLogin] = useState(true); // По умолчанию показываем форму входа
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_300Light });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [alert, setAlert] = useState(null); // { variant: 'error' | 'success', message: string }
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginEmail, setLoginEmail] = useState(TEST_ACCOUNT.email);
  const [loginPassword, setLoginPassword] = useState(TEST_ACCOUNT.password);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regCreator, setRegCreator] = useState(true);

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

    if (email.toLowerCase() !== TEST_ACCOUNT.email.toLowerCase()) {
      setFieldError('loginPassword', 'Пользователь не найден');
      return;
    }

    if (password !== TEST_ACCOUNT.password) {
      setFieldError('loginPassword', 'Неверный пароль');
      return;
    }

    setAlert({ variant: 'success', message: 'Успешный вход' });
    setIsLoggedIn(true);
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

    const hasAnyError = Object.keys(fieldErrors).length > 0;
    // fieldErrors обновляются асинхронно — проверим вручную теми же условиями
    const shouldFail =
      !username ||
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.loginEmail}</Text>
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.loginPassword}</Text>
                        ) : null}
                        <TouchableOpacity
                          onPress={handleLogin}
                          className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center"
                        >
                          <Text className="font-roboto text-[16px] text-white font-medium">Войти</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="items-center pt-[14px] pb-[14px]">
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] underline font-robotoLight">Забыли пароль?</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* --- ФОРМА РЕГИСТРАЦИИ --- */
                      <View>
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.regUsername}</Text>
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.regEmail}</Text>
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.regPassword}</Text>
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
                          <Text style={{ lineHeight: 22, textAlignVertical: 'center', includeFontPadding: false }} className="text-[#F23030] text-[14px] font-roboto text-center mt-[10px] mb-[10px]">{fieldErrors.regPassword2}</Text>
                        ) : null}

                        <TouchableOpacity
                          onPress={() => setRegCreator((prev) => !prev)}
                          activeOpacity={0.8}
                          className="flex-row items-center mb-[10px]"
                        >
                          <View
                            className={`w-[22px] h-[22px] rounded-[6px] items-center justify-center mr-[10px] ${regCreator ? 'bg-[#76113A]' : 'border border-[#76113A] bg-white'}`}
                          >
                            {regCreator ? (
                              <View className="relative w-[14px] h-[12px]">
                                <View
                                  style={{
                                    position: 'absolute',
                                    left: 2,
                                    top: 4,
                                    width: 2,
                                    height: 7,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 999,
                                    transform: [{ rotate: '-45deg' }],
                                  }}
                                />
                                <View
                                  style={{
                                    position: 'absolute',
                                    left: 7.5,
                                    top: 0.5,
                                    width: 2,
                                    height: 12,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 999,
                                    transform: [{ rotate: '45deg' }],
                                  }}
                                />
                              </View>
                            ) : null}
                          </View>
                          <Text className="font-roboto text-[16px] text-[#252525]">Создатель Хайпа</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleRegister} className="bg-[#76113A] w-full max-w-[338px] h-[51px] rounded-[12px] items-center justify-center self-center mb-[16px]">
                          <Text className="font-roboto text-[16px] text-white font-medium">Зарегистрироваться</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                    </View>
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
  shadowWrap: {
    marginTop: 20,
    width: '100%',
    maxWidth: 370,
    position: 'relative',
    ...Platform.select({
      ios: {
        // iOS shadow рисуем на вложенных врапперах (shadowIOSLeft/shadowIOSRight)
        shadowOpacity: 0,
      },
      android: {
        // Цветной blur-shadow на Android ограничен, поэтому рисуем "подложки" (см. androidShadow*)
        elevation: 0,
      },
      web: {
        boxShadow:
          '-6px 10px 14px 0px rgba(242, 239, 255, 0.45), 6px 10px 12px 0px rgba(242, 239, 255, 0.45)',
      }
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
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 10,
  },
  alertText: {
    flex: 1,
    fontFamily: 'Roboto',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  alertClose: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
