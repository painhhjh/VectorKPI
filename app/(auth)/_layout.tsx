import React from 'react';
import { Tabs, useRouter } from 'expo-router'; // Importa useRouter
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, Platform } from 'react-native';
import { COLORS, SIZES, styles } from '../../styles/auth.styles';

export default function TabLayout() {
  const router = useRouter(); // Inicializa el router

  return (
    <Tabs 
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: SIZES.tabBar.height,
          ...styles.shadowSecondary,
          ...Platform.select({
            web: {
              maxWidth: 480,
              marginHorizontal: 'auto',
              borderRadius: 24,
              marginBottom: 8,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
            },
            android: {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              elevation: 8
            }
          }),
        },
      }}>
      
      <Tabs.Screen 
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
          tabBarItemStyle: styles.tabRegularItem,
        }}
      />
      <Tabs.Screen 
        name="guardados"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bookmark' : 'bookmark-outline'} color={color} />
          ),
          tabBarItemStyle: styles.tabRegularItem,
        }}
      />

      <Tabs.Screen 
        name="Crear"
        options={{
          tabBarIcon: ({ focused }) => (
            <Pressable
              style={({ pressed: isPressed }) => [
                styles.tabFabContainer,
                { transform: [{ scale: isPressed ? 0.95 : 1 }] }
              ]}
              android_ripple={{ 
                color: 'rgba(46, 204, 113, 0.2)',
                borderless: true,
                radius: (SIZES.tabBar.fab ?? 0) / 2,
              }}
              onPress={() => router.push('/Crear')} // Agrega onPress para la navegación
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[styles.tabFabContainer, styles.shadowSecondary]}
              >
                <Ionicons 
                  name="add" 
                  size={Platform.select({ android: 30, default: 32 })}
                  color={COLORS.white} 
                  style={{ marginTop: Platform.select({ android: 2, default: 0 }) }}
                />
              </LinearGradient>
            </Pressable>
          ),
          tabBarItemStyle: [styles.tabFabItem, {
            marginHorizontal: Platform.select({
              android: 12,
              ios: 6,
              web: 12
            })
          }]
        }}
      />

      <Tabs.Screen 
        name="notificaciones"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
          tabBarItemStyle: styles.tabRegularItem,
        }}
      />
      <Tabs.Screen 
        name="perfil"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
          tabBarItemStyle: styles.tabRegularItem,
        }}
      />
    </Tabs>
  );
}

const TabIcon = ({ name, color }: { name: string; color: string }) => (
  <View style={styles.tabIconContainer}>
    <Ionicons 
      name={name as any} 
      size={SIZES.tabBar.icon} 
      color={color} 
      style={[
        Platform.select({
          web: styles.shadowPrimary,
          native: {
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }
        }),
        Platform.select({
          android: { 
            marginTop: 4,
            transform: [{ translateX: -0.5 }] // Ajuste fino de centrado
          },
          default: {}
        })
      ]}
    />
    {!name.includes('-outline') && <View style={styles.tabActiveIndicator} />}
  </View>
);