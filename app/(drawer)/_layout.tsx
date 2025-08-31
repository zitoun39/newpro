// app/(drawer)/_layout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { Feather } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useTheme } from "@/src/contexts/ThemeContext";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";

function CustomDrawerContent(props: any) {
  const { theme } = useTheme();
  
  // Get app version from Constants
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const versionCode = Constants.expoConfig?.android?.versionCode;
  const versionText = versionCode ? `v${appVersion} (${versionCode})` : `v${appVersion}`;
  
  return (
    <DrawerContentScrollView 
      {...props} 
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{ flex: 1 }}
    >
      {/* Header */}
      <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.drawerHeaderTitle}>HakooLab</Text>
        <Text style={styles.drawerHeaderSubtitle}>رفيقك الهندسي</Text>
      </View>
      
      {/* Theme Toggle */}
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>
      
      {/* Navigation Items */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>
      
      {/* Footer with automatic version */}
      <View style={[styles.drawerFooter, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          إصدار {versionText}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { theme } = useTheme();
  
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: 'HakooLab',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerRight: () => null, // Remove theme toggle from headers
        drawerActiveTintColor: theme.colors.primary,
        drawerActiveBackgroundColor: `${theme.colors.primary}20`,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: { 
          fontSize: 16, 
          fontWeight: '500',
          textAlign: 'auto',
          marginStart: 0,
          marginEnd: 0,
          writingDirection: 'auto',
        },
        drawerItemStyle: {
          marginHorizontal: 12,
          marginVertical: 2,
          borderRadius: 8,
        },
        drawerStyle: { backgroundColor: theme.colors.surface },
        drawerContentStyle: { backgroundColor: theme.colors.surface },
        drawerPosition: 'right', // Force drawer on the right for RTL
        drawerType: 'front',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: 'HakooLab',
          drawerLabel: "الرئيسية",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          headerTitle: 'HakooLab',
          drawerLabel: "المفضّلة",
          drawerIcon: ({ color, size }) => (
            <Feather name="star" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="contact"
        options={{
          headerTitle: 'HakooLab',
          drawerLabel: "الاتصال والدعم الفني",
          drawerIcon: ({ color, size }) => (
            <Feather name="phone" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          headerTitle: 'HakooLab',
          drawerLabel: "حول التطبيق",
          drawerIcon: ({ color, size }) => (
            <Feather name="info" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="exit"
        options={{
          drawerLabel: "الخروج",
          drawerIcon: ({ color, size }) => (
            <Feather name="log-out" size={size} color={color} />
          ),
        }}
      />
      
      {/* Note: (hidden) routes are handled by nested Stack navigation in app/(hidden)/_layout.tsx */}
      {/* They don't need to be registered here as Drawer screens */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 60, // Increased from 40 to 60 for better spacing
    marginBottom: 16,
  },
  drawerHeaderTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  drawerHeaderSubtitle: {
    color: '#e2e8f0',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4,
  },
  themeToggleContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  drawerFooter: {
    borderTopWidth: 1,
    padding: 16,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'right',
  },
});
