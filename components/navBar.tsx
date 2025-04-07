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
    <View style={styles.navBarContainer}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={item.onPress}
        >
          <Text style={[styles.icon, item.isActive && styles.activeIcon]}>{item.icon}</Text>
          <Text style={[styles.label, item.isActive && styles.activeLabel]}>{item.label}</Text>
          {item.isActive && <View style={styles.activeDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 32,
    borderTopWidth: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 6,
    width: 70,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeIcon: {
    color: theme.colors.text,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeLabel: {
    color: theme.colors.text,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text,
    marginTop: 2,
  },
});

export default NavBar;