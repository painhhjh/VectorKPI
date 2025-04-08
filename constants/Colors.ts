// Define un tipo para la paleta de colores para una mejor verificación de tipos
type ColorPalette = {
    primary: string;
    primaryLight: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    white: string;
    black: string;
    gray: string;
    lightGray: string;
  };
  
  // Define la paleta de colores para el tema claro
  const lightColors: ColorPalette = {
    primary: '#005A9C', // Un azul corporativo
    primaryLight: '#E0F2FF', // Un azul muy claro para fondos sutiles
    accent: '#FFB600', // Un acento amarillo/dorado
    background: '#F8F9FA', // Un gris muy claro para el fondo general
    cardBackground: '#FFFFFF', // Blanco para las tarjetas
    text: '#212529', // Negro/gris oscuro para texto principal
    textSecondary: '#6C757D', // Gris para texto secundario o menos importante
    border: '#DEE2E6', // Gris claro para bordes
    success: '#28A745', // Verde para éxito o tendencia positiva
    warning: '#FFC107', // Amarillo para advertencias
    danger: '#DC3545', // Rojo para errores o tendencia negativa
    white: '#FFFFFF',
    black: '#000000',
    gray: '#6C757D',
    lightGray: '#CED4DA',
  };
  
  // Define la paleta de colores para el tema oscuro
  const darkColors: ColorPalette = {
    primary: '#3498DB', // Un azul más oscuro para el tema oscuro
    primaryLight: '#66CCCC', // Un azul claro para fondos sutiles en el tema oscuro
    accent: '#FF9900', // Un acento naranja para el tema oscuro
    background: '#2F343A', // Un gris oscuro para el fondo general
    cardBackground: '#333333', // Un gris oscuro para las tarjetas
    text: '#FFFFFF', // Blanco para texto principal
    textSecondary: '#AAAAAA', // Gris claro para texto secundario
    border: '#444444', // Gris oscuro para bordes
    success: '#34C759', // Verde más oscuro para éxito o tendencia positiva
    warning: '#FFA07A', // Naranja claro para advertencias
    danger: '#E74C3C', // Rojo más oscuro para errores o tendencia negativa
    white: '#FFFFFF',
    black: '#000000',
    gray: '#6C757D',
    lightGray: '#AAAAAA',
  };
  
  // Exporta el tema actualmente activo (comenzando con el tema claro)
  const Colors: ColorPalette = lightColors;
  
  // Para cambiar al tema oscuro, simplemente asigna darkColors a Colors
  // const Colors: ColorPalette = darkColors;
  
  export default Colors;
  