import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { styled } from 'nativewind';

// Стилизуем компоненты через NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Декоративные круги на фоне --- */}
      <View className="absolute w-full h-full overflow-hidden">
        <View className="absolute w-40 h-40 bg-[#FF501A] rounded-full -left-10 bottom-40 opacity-90" />
        <View className="absolute w-32 h-32 bg-[#7000FF] rounded-full -right-5 bottom-20 opacity-90" />
        <View className="absolute w-16 h-16 bg-[#D7CCFB] rounded-full left-40 bottom-5" />
      </View>

      <View className="flex-1 items-center justify-start pt-12 px-6">
        
        {/* --- Логотип --- */}
        <View className="flex-row items-center mb-10">
          <View className="w-8 h-10 bg-[#7000FF] rounded-tr-xl rounded-bl-xl mr-2" /> 
          <Text className="text-3xl font-bold text-[#182030]">Ростелеком</Text>
        </View>

        {/* --- Карточка формы --- */}
        <View 
          className="w-full bg-white rounded-3xl p-6 shadow-2xl shadow-purple-500/20 border border-gray-50"
          style={{ elevation: 10 }} // Для тени на Android
        >
          {/* Табы */}
          <View className="flex-row justify-around mb-8 border-b border-gray-100 pb-4">
            <TouchableOpacity onPress={() => setIsLogin(true)}>
              <Text className={`text-lg ${isLogin ? 'text-black font-bold' : 'text-gray-300'}`}>Войти</Text>
            </TouchableOpacity>
            <View className="w-[1px] h-6 bg-gray-200" />
            <TouchableOpacity onPress={() => setIsLogin(false)}>
              <Text className={`text-lg ${!isLogin ? 'text-black font-bold' : 'text-gray-300'}`}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>

          {/* Поля ввода */}
          <View className="gap-y-4">
            <TextInput 
              placeholder="Введите логин"
              className="w-full border border-gray-200 p-4 rounded-xl text-base"
              placeholderTextColor="#CCC"
            />
            <TextInput 
              placeholder="Введите пароль"
              secureTextEntry
              className="w-full border border-gray-200 p-4 rounded-xl text-base"
              placeholderTextColor="#CCC"
            />
          </View>

          {/* Кнопка Войти */}
          <TouchableOpacity 
            className="bg-[#7000FF] w-full py-4 rounded-xl mt-6 items-center shadow-lg shadow-purple-500"
          >
            <Text className="text-white text-lg font-bold">Войти</Text>
          </TouchableOpacity>

          {/* Ссылка забыли пароль */}
          <TouchableOpacity className="mt-4 items-center">
            <Text className="text-[#FF501A] text-base">Забыли пароль?</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}