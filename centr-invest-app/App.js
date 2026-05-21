import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Roboto_400Regular, Roboto_300Light } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_300Light });

  if (!fontsLoaded) return null;
  else SplashScreen.hideAsync();

  return (
    <SafeAreaProvider>
      {/* Фон всего экрана */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        
        {/* Декоративные шары (поверх фона, под формой) */}
        <View className="absolute w-full h-full" pointerEvents="none">
          <View className="absolute w-[180px] h-[180px] bg-[#FF501A] rounded-full -left-20 bottom-[30%] opacity-20" />
          <View className="absolute w-[140px] h-[140px] bg-[#7700FF] rounded-full -right-10 bottom-[15%] opacity-20" />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 px-[46px] pb-10">
              
              {/* Логотип */}
              <View style={{ width: 190, height: 67 }} className="mt-[130px] self-center items-center justify-center flex-row">
                <View className="w-8 h-10 bg-[#7700FF] rounded-tr-xl rounded-bl-xl mr-2" />
                <Text className="text-2xl font-bold text-[#182030]">Тест</Text>
              </View>

              {/* БЕЛЫЙ БОКС С ТЕНЬЮ */}
              <View style={styles.shadowContainer}>
                <View 
                  className="bg-white rounded-[8px] border border-[#EAEBED] overflow-hidden"
                >
                  {/* ТАБЫ */}
                  <View className="items-center pt-[16px]">
                    <View style={{ width: 250, minHeight: 24 }} className="flex-row items-center justify-center">
                      <TouchableOpacity onPress={() => setIsLogin(true)} className="py-[4px]">
                        <Text className={`font-roboto text-[16px] ${isLogin ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}>Войти</Text>
                      </TouchableOpacity>
                      <View className="mx-[24px] w-[1px] h-[16px] bg-[#000000]" />
                      <TouchableOpacity onPress={() => setIsLogin(false)} className="py-[4px]">
                        <Text className={`font-roboto text-[16px] ${!isLogin ? 'text-[#000000]' : 'text-[#D6D6D6]'}`}>Зарегистрироваться</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ФОРМА */}
                  <View className="px-[16px] mt-[10px]">
                    <TextInput 
                      placeholder="Введите логин" 
                      placeholderTextColor="#D6D6D6"
                      className="w-full h-[56px] border border-[#EAEBED] px-[16px] rounded-[8px] font-roboto text-[16px] mb-[10px]"
                    />
                    <TextInput 
                      placeholder="Введите пароль" 
                      placeholderTextColor="#D6D6D6"
                      secureTextEntry
                      className="w-full h-[56px] border border-[#EAEBED] px-[16px] rounded-[8px] font-roboto text-[16px] mb-[10px]"
                    />
                    <TouchableOpacity className="bg-[#7700FF] w-full h-[56px] rounded-[8px] items-center justify-center">
                      <Text className="font-roboto text-[16px] text-white font-medium">Войти</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="items-center py-[16px]">
                      <Text className="text-[#FF501A] text-[14px] underline font-robotoLight">Забыли пароль?</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    marginTop: 20,
    // Настройки тени
    ...Platform.select({
      ios: {
        shadowColor: '#000', // Используем черный, т.к. F2EFFF на фоне F2EFFF не виден
        shadowOffset: { width: -6, height: 6 },
        shadowOpacity: 0.1, // Маленькая прозрачность, чтобы тень была нежной
        shadowRadius: 5,
      },
      android: {
        elevation: 10, // На Android только так
      },
      web: {
        // Для веба можно прописать в точности как в Figma
        boxShadow: '-6px 6px 5px 0px rgba(242, 239, 255, 0.75)',
      }
    }),
  },
});