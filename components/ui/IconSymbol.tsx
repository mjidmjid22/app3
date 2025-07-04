import React from 'react';
import { Text } from 'react-native';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

export const IconSymbol = ({ name, size = 24, color = 'black' }: IconSymbolProps) => {
  return <Text style={{ fontSize: size, color }}>{name}</Text>;
};
