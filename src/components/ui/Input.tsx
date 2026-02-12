import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2 ml-1">{label}</Text>
      
      <TextInput 
        className={`w-full bg-gray-50 border rounded-xl p-4 text-lg ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-600 focus:bg-white'
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}