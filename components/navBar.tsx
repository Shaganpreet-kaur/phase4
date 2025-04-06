
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface NavItem {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

interface NavBarProps {
  items: NavItem[];
}

const NavBar: React.FC<NavBarProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.navItem, item.isActive && styles.activeItem]}
          onPress={item.onPress}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.spacing.large,
    left: theme.spacing.large,
    right: theme.spacing.large,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.borderRadius.large,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.medium,
  },
  navItem: {
    alignItems: 'center',
    padding: theme.spacing.small,
    minWidth: 60,
  },
  activeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.medium,
  },
  icon: {
    fontSize: theme.fontSize.xxxlarge,
    marginBottom: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
  },
});

export default NavBar;