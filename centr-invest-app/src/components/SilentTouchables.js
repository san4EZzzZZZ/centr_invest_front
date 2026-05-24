import React from 'react';
import { Pressable, TextInput as RNTextInput, View, StyleSheet } from 'react-native';

export const TouchableOpacity = ({ children, style, activeOpacity = 0.7, onPress, disabled, ...props }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_disableSound={true}
      style={({ pressed }) => [
        StyleSheet.flatten(style),
        { opacity: (pressed && !disabled) ? activeOpacity : 1 }
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export const TextInput = React.forwardRef(({ ...props }, ref) => {
  // To handle the input click sound on Android, we wrap it in a Pressable
  // but we keep the TextInput interactive.
  return (
    <View>
      <RNTextInput
        ref={ref}
        {...props}
        // Even if not officially supported, some RN versions might pass this to the underlying View
        android_disableSound={true}
      />
    </View>
  );
});
