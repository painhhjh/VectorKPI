import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define unidades de espaciado estándar
const spacingUnit = 8;

const Layout = {
    // Dimensiones de la pantalla
    screen: {
        width: screenWidth,
        height: screenHeight,
        isPortrait: screenHeight > screenWidth,
        isLandscape: screenWidth > screenHeight,
    },
    // Valores de espaciado comunes
    spacing: {
        tiny: spacingUnit / 2, // 4
        small: spacingUnit, // 8
        medium: spacingUnit * 2, // 16
        large: spacingUnit * 3, // 24
        xlarge: spacingUnit * 4, // 32
        xxlarge: spacingUnit * 6, // 48
    },
    // Valores de radio de esquina
    borderRadius: {
        none: 0,
        small: spacingUnit / 2, // 4
        medium: spacingUnit, // 8
        large: spacingUnit * 2, // 16
        xlarge: spacingUnit * 3, // 24
        round: Math.min(screenWidth, screenHeight) / 2, // Dinámico para crear un círculo perfecto
    },
    // Tamaños de fuente
    fontSize: {
        caption: 12,
        body: 14,
        subheading: 16,
        heading: 18,
        title: 22,
        display: 28,
        largeTitle: 34,
    },
    // Hit slop común para componentes táctiles
    touchableHitSlop: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    },
    // Ajustes específicos de plataforma
    platform: {
        isIOS: Platform.OS === 'ios',
        isAndroid: Platform.OS === 'android',
        isWeb: Platform.OS === 'web',
    },
    // Escala de diseño para tamaños relativos
    scale: {
        small: screenWidth * 0.25,
        medium: screenWidth * 0.5,
        large: screenWidth * 0.75,
        full: screenWidth,
    },
};

export default Layout;