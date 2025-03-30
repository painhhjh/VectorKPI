import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
  primary: '#2ecc71',
  secondary: '#27ae60',
  inactive: '#95a5a6',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#2c3e50',
};

export const SIZES = {
  tabBar: {
    height: Platform.select({ ios: 88, android: 60, web: 72 }),
    icon: Platform.select({ ios: 28, android: 28, web: 28 }),
    fab: Platform.select({ ios: 56, android: 56, web: 56 }),
    itemHeight: Platform.select({ android: 64, ios: 68, web: 60 }),
    regularWidth: Platform.select({ android: 84, default: 80 }),
  },
  auth: {
    title: Platform.select({ web: 48, default: 40 }),
    buttonText: 18,
  }
};

export const styles = StyleSheet.create({
  shadowPrimary: Platform.select({
    web: {
      boxShadow: '0 2px 3px rgba(46, 204, 113, 0.1)'
    },
    default: {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: Platform.OS === 'android' ? 3 : 0,
    }
  }),

  shadowSecondary: Platform.select({
    web: {
      boxShadow: '0 4px 8px rgba(39, 174, 96, 0.3)'
    },
    default: {
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: Platform.OS === 'android' ? 8 : 0,
    }
  }),

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.auth.title,
    fontWeight: "800",
    marginBottom: 30,
    letterSpacing: -0.5,
    ...Platform.select({
      web: {
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: "contain",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(46, 204, 113, 0.3)',
        ':hover': {
          transform: [{ scale: 1.05 }],
          backgroundColor: COLORS.secondary,
          boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)'
        }
      },
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.auth.buttonText,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Estilos de tabs
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: Platform.select({ android: 64, default: '100%' }),
    paddingHorizontal: Platform.select({ android: 0, default: 8 }),
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: Platform.select({ android: 2, default: -8 }),
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabRegularItem: {
    flex: 1,
    maxWidth: SIZES.tabBar.regularWidth,
    marginHorizontal: Platform.select({ android: 4, default: 6 }),
    borderRadius: 14,
    height: SIZES.tabBar.itemHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabFabContainer: {
    width: SIZES.tabBar.fab,
    height: SIZES.tabBar.fab,
    borderRadius: SIZES.tabBar.fab / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabFabItem: {
    width: SIZES.tabBar.fab,
    height: SIZES.tabBar.fab,
    marginHorizontal: Platform.select({
      android: 12,
      ios: 6,
      web: 12
    }),
    transform: [{ translateY: Platform.select({
      android: -6,
      ios: -10,
      default: 0
    }) }],
  }
});