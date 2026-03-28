import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/core/store';
import { useShopStatus } from '@/src/core/hooks/useShopStatus';
import { useShopDashboard } from '@/src/core/hooks/useShopDashboard';
import { useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Eye, EyeOff, Globe, Lock, LogOut, Printer, ShieldCheck, User } from 'lucide-react-native';

// --- Reusable Settings Row Component ---
const SettingsRow = ({ icon, label, value, isSwitch, enabled, onToggle, onPress, isDestructive }: any) => (
  <TouchableOpacity 
    activeOpacity={isSwitch ? 1 : 0.7}
    onPress={isSwitch ? onToggle : onPress}
    className="flex-row items-center justify-between px-5 py-4 bg-white active:bg-gray-50"
  >
    <View className="flex-row items-center">
      {/* Icon Wrapper */}
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-50' : 'bg-gray-100'}`}>
        {icon}
      </View>
      <Text className={`font-semibold text-base ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
        {label}
      </Text>
    </View>

    <View className="flex-row items-center">
      {value && <Text className="text-gray-400 mr-2 text-sm">{value}</Text>}
      
      {isSwitch ? (
        <Switch 
          value={enabled} 
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
          thumbColor={'#FFFFFF'}
        />
      ) : (
        !isDestructive && <ChevronRight size={20} color="#D1D5DB" />
      )}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, ownerPin, setOwnerPin, verifyPin } = useAuthStore();

  // Shop online/offline — shared globally with Orders screen
  const { isOnline: isShopOpen, isToggling, toggleStatus } = useShopStatus();

  // Shop Dashboard (Earnings) Data
  const { dashboardData, fetchDashboard } = useShopDashboard();

  // Fetch dashboard data on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  // Local State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEarnings, setShowEarnings] = useState(false); // Default hidden for safety
  
  // --- PIN MODAL STATE ---
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinMode, setPinMode] = useState<'SETUP' | 'VERIFY' | 'CHANGE'>('SETUP');

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logout(); // Clear store
            router.replace('/'); 
          }
        }
      ]
    );
  };

  // --- PIN LOGIC HANDLERS ---
  
  // 1. Toggle the Lock Switch
  const handleToggleLock = () => {
    if (ownerPin) {
      // If PIN exists, verify before removing
      Alert.alert("Disable Security", "Do you want to remove the PIN lock?", [
        { text: "Cancel", style: "cancel" },
        { text: "Remove PIN", style: "destructive", onPress: () => setOwnerPin(null) }
      ]);
    } else {
      // Setup new PIN
      setPinMode('SETUP');
      setPinInput('');
      setPinModalVisible(true);
    }
  };

  // 2. Change PIN Request
  const handleChangePinRequest = () => {
    setPinMode('CHANGE'); // First verify old, then set new
    setPinInput('');
    setPinModalVisible(true);
  };

  // 3. Reveal Earnings (Eye Icon)
  const handleRevealEarnings = () => {
    if (showEarnings) {
      setShowEarnings(false); // Hide immediately
    } else {
      if (ownerPin) {
        // If PIN is set, ask for it
        setPinMode('VERIFY');
        setPinInput('');
        setPinModalVisible(true);
      } else {
        // No PIN set, just show it
        setShowEarnings(true); 
      }
    }
  };

  // 4. Submit PIN from Modal
  const handlePinSubmit = () => {
    if (pinInput.length !== 4) {
      Alert.alert("Invalid PIN", "Please enter a 4-digit PIN.");
      return;
    }

    if (pinMode === 'SETUP') {
      setOwnerPin(pinInput);
      setPinModalVisible(false);
      Alert.alert("Success", "Security PIN has been set!");
    } 
    else if (pinMode === 'VERIFY') {
      if (verifyPin(pinInput)) {
        setShowEarnings(true); // Success: Show the money
        setPinModalVisible(false);
      } else {
        Alert.alert("Wrong PIN", "Access Denied.");
        setPinInput('');
      }
    }
    else if (pinMode === 'CHANGE') {
      // Verify old PIN first
      if (verifyPin(pinInput)) {
         setOwnerPin(null); // Reset
         setPinModalVisible(false);
         // Ask for new PIN after a slight delay
         setTimeout(() => {
           setPinMode('SETUP');
           setPinModalVisible(true);
         }, 500);
      } else {
        Alert.alert("Wrong PIN", "Please enter your current PIN to change it.");
        setPinInput('');
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        
        {/* 1. Profile Header */}
        <View className="bg-white px-6 py-6 mb-2 border-b border-gray-100 flex-row items-center">
          <View className="h-16 w-16 bg-green-100 rounded-full items-center justify-center mr-4 border border-green-200">
             <User size={32} color="#16A34A" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">{dashboardData?.shop_name || 'My Shop'}</Text>
            <Text className="text-gray-500 font-medium text-sm">+91 {dashboardData?.mobile || '98765 43210'}</Text>
            <View className="bg-green-100 self-start px-2 py-0.5 rounded mt-1.5">
              <Text className="text-green-700 text-[10px] font-bold tracking-wide">VERIFIED PARTNER</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* 2. 💰 EARNINGS CARD */}
          <View className="mx-4 mt-4 mb-6">
            <View className="bg-green-600 rounded-2xl p-5 shadow-lg shadow-green-200">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-green-100 font-medium text-xs uppercase tracking-widest mb-1">
                    Total Earnings
                  </Text>
                  
                  {/* Amount Display with Privacy Toggle */}
                  <View className="flex-row items-center">
                    <Text className="text-white text-3xl font-bold mr-3">
                      {showEarnings ? `₹${dashboardData?.total_earnings?.toLocaleString() || '0'}` : '₹ • • • •'}
                    </Text>
                    <TouchableOpacity onPress={handleRevealEarnings}>
                      {showEarnings ? (
                        <EyeOff size={20} color="#BBF7D0" />
                      ) : (
                        <Eye size={20} color="#BBF7D0" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Small Stat Box */}
                <View className="bg-green-700 px-3 py-2 rounded-lg items-center">
                   <Text className="text-green-100 text-[10px] font-bold">TODAY</Text>
                   <Text className="text-white font-bold">₹{dashboardData?.today_earnings?.toLocaleString() || '0'}</Text>
                </View>
              </View>

              <Text className="text-green-100 text-xs mt-4 opacity-80">
                Last updated: Just now
              </Text>
            </View>
          </View>

          {/* 3. SETTINGS SECTIONS */}

          {/* SECTION: STORE CONTROLS */}
          <Text className="px-6 mb-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
            Store Controls
          </Text>
          <View className="bg-white mb-6 border-t border-b border-gray-100">
            <SettingsRow
              icon={<ShieldCheck size={18} color={isShopOpen ? '#16A34A' : '#4B5563'} />}
              label={isToggling
                ? (isShopOpen ? 'Going Online...' : 'Going Offline...')
                : 'Accepting Orders'
              }
              isSwitch
              enabled={isShopOpen}
              onToggle={() => toggleStatus(!isShopOpen)}
            />
          </View>

          {/* SECTION: SECURITY & ACCESS */}
          <Text className="px-6 mb-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
            Security & Access
          </Text>
          <View className="bg-white mb-6 border-t border-b border-gray-100">
            {/* Owner PIN Toggle */}
            <SettingsRow 
              icon={<Lock size={18} color={ownerPin ? "#16A34A" : "#4B5563"} />} 
              label={ownerPin ? "Security Enabled" : "Enable Owner PIN"} 
              isSwitch 
              enabled={!!ownerPin} 
              onToggle={() => alert('Pin setup coming soon!')}
              // onToggle={handleToggleLock} 
            />
            {/* Change PIN Option (Only visible if PIN is set) */}
             {ownerPin && (
               <SettingsRow 
                 icon={<User size={18} color="#4B5563" />} 
                 label="Change 4-Digit PIN" 
                 onPress={handleChangePinRequest} 
               />
             )}
          </View>

          {/* SECTION: PREFERENCES */}
          <Text className="px-6 mb-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
            Preferences
          </Text>
          <View className="bg-white mb-6 border-t border-b border-gray-100">
            <SettingsRow 
              icon={<Bell size={18} color="#4B5563" />} 
              label="Order Sound" 
              isSwitch 
              enabled={soundEnabled} 
              onToggle={() => setSoundEnabled(!soundEnabled)} 
            />
            <SettingsRow 
              icon={<Printer size={18} color="#4B5563" />} 
              label="Printer Settings" 
              value="None"
              onPress={() => alert('Printer setup coming soon!')}
            />
            <SettingsRow 
              icon={<Globe size={18} color="#4B5563" />} 
              label="Language" 
              value="English" 
              onPress={() => alert('Language options coming soon')}
            />
          </View>

          {/* SECTION: DANGER */}
          <View className="bg-white mt-2 border-t border-b border-gray-100 mb-10">
            <SettingsRow 
              icon={<LogOut size={18} color="#DC2626" />} 
              label="Logout" 
              isDestructive 
              onPress={handleLogout} 
            />
          </View>
          
          <Text className="text-center text-gray-300 text-[10px] font-bold mb-10">
            VERSION 1.0.2 • BUILD 2026
          </Text>

        </ScrollView>
      </SafeAreaView>

      {/* --- PIN ENTRY MODAL (New Addition) --- */}
      <Modal visible={isPinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center shadow-xl">
            
            {/* Modal Title */}
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {pinMode === 'SETUP' ? 'Set New PIN' : 'Enter Owner PIN'}
            </Text>
            
            {/* Modal Subtitle */}
            <Text className="text-gray-500 mb-6 text-center text-sm px-4">
              {pinMode === 'SETUP' 
                ? 'Create a 4-digit code to protect your earnings.' 
                : 'Enter your 4-digit code to verify access.'}
            </Text>

            {/* PIN Input */}
            <TextInput 
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              autoFocus
              className="bg-gray-100 w-full text-center text-3xl font-bold py-4 rounded-xl tracking-widest border border-gray-200 mb-6 text-gray-900"
              placeholder="••••"
              placeholderTextColor="#9CA3AF"
            />

            {/* Modal Actions */}
            <View className="flex-row w-full space-x-3">
              <TouchableOpacity 
                onPress={() => setPinModalVisible(false)} 
                className="flex-1 py-3 bg-gray-100 rounded-xl items-center border border-gray-200"
              >
                <Text className="font-bold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handlePinSubmit} 
                className="flex-1 py-3 bg-green-600 rounded-xl items-center shadow-sm"
              >
                <Text className="font-bold text-white">
                  {pinMode === 'SETUP' ? 'Save PIN' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}