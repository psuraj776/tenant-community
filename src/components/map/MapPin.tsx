/**
 * Map Pin Component
 * Display pins on map with VIBGYOR color coding
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MapPin as MapPinType} from '@types';
import {getColorByAge} from '@utils';
import theme from '@theme';

interface MapPinProps {
  pin: MapPinType;
  onPress?: () => void;
}

export const MapPinComponent: React.FC<MapPinProps> = ({pin}) => {
  const color = getColorByAge(pin.createdAt);

  return (
    <View style={[styles.container, {backgroundColor: color}]}>
      <View style={styles.inner}>
        <Text style={styles.text}>{pin.type[0]}</Text>
      </View>
      <View style={[styles.triangle, {borderTopColor: color}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  inner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  triangle: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
