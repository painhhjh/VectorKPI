/**
 * @file Hook personalizado para acceder fácilmente al Contexto de Autenticación.
 * @description Proporciona una forma limpia de consumir los datos y funciones de AuthContext.
 */
import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Ajusta la ruta si es necesario

// Hook personalizado useAuth
export const useAuth = () => {
  // Obtiene el valor actual del contexto AuthContext
  const contexto = useContext(AuthContext);

  // Verifica si el hook se está usando dentro de un AuthProvider
  if (contexto === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }

  // Devuelve los datos y funciones del contexto
  return contexto;
};
