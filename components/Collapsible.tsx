import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.header}>
        <Text style={styles.title}>{title} {open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f0f0f0',
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 12,
    backgroundColor: '#fff',
  },
});
