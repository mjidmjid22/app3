import React from 'react';
import { View, StyleSheet } from 'react-native';

const TabBarBackground = () => {
  return <View style={styles.background} />;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)', // semi-transparent white
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: '#eee',
    borderTopWidth: 1,
    // You can add shadow or blur here if needed
  },
});

export default TabBarBackground;
