import React from 'react';
import { Text, Linking, StyleSheet, TouchableOpacity } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
  const handlePress = () => {
    Linking.openURL(href);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.link}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    // Optional: add link styling
  },
  text: {
    color: '#1B95E0',
    textDecorationLine: 'underline',
  },
});
