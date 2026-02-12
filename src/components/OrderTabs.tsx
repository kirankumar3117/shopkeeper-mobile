import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Changed 'new' to 'all' as requested
type TabType = 'all' | 'preparing' | 'ready';

interface OrderTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts?: { [key in TabType]?: number };
}

export function OrderTabs({ activeTab, onTabChange, counts }: OrderTabsProps) {
  const tabs: TabType[] = ['all', 'preparing', 'ready'];

  return (
    <View>
      <View className="flex-row bg-green-600 rounded-lg border border-gray-200 overflow-hidden h-12">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.9}
              className={`flex-1 items-center justify-center ${
                isActive ? 'bg-green-600' : 'bg-white'
              } ${index > 0 ? 'border-l border-gray-300' : ''}`}
            >
              <Text className={`font-bold text-base capitalize ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {tab} {counts && counts[tab] !== undefined ? `(${counts[tab]})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}