import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  isSwitch?: boolean;
  enabled?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  isDestructive?: boolean; // For "Logout" (Red color)
}

export function SettingsRow({ 
  icon, label, value, isSwitch, enabled, onToggle, onPress, isDestructive 
}: SettingsRowProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={isSwitch ? 1 : 0.7} // Disable click effect for switches
      className="flex-row items-center justify-between bg-white p-4 mb-[1px]"
    >
      <View className="flex-row items-center">
        <View className={`h-10 w-10 rounded-full items-center justify-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-gray-100'}`}>
          <Text className="text-xl">{icon}</Text>
        </View>
        <Text className={`text-lg font-medium ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
          {label}
        </Text>
      </View>

      {/* Right Side: Switch, Value, or Arrow */}
      {isSwitch ? (
        <Switch 
          value={enabled} 
          onValueChange={onToggle}
          trackColor={{ false: "#E5E7EB", true: "#DCFCE7" }}
          thumbColor={enabled ? "#16A34A" : "#F3F4F6"}
        />
      ) : (
        <View className="flex-row items-center">
          {value && <Text className="text-gray-500 mr-2">{value}</Text>}
          {!isDestructive && <Text className="text-gray-400 text-xl">›</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}