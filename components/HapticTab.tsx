// components/HapticTab.tsx
import React from 'react';
import { View, TouchableOpacity, Platform, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TabItem {
  label: string;
  onPress: () => void;
}

interface HapticTabProps {
  tabs: TabItem[];
  activeIndex: number;
}

const HapticTab: React.FC<HapticTabProps> = ({ tabs, activeIndex }) => {
  const handlePress = (onPress: () => void) => {
    // Trigger haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync(); // Fallback for Android
    }

    onPress();
  };

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tabButton,
            activeIndex === index && styles.activeTab,
          ]}
          onPress={() => handlePress(tab.onPress)}
        >
          <Text style={[
            styles.tabLabel,
            activeIndex === index && styles.activeLabel,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = {
  tabContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabLabel: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  activeLabel: {
    color: '#fff',
    fontWeight: 'bold' as const,
  },
};

export default HapticTab;