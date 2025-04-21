/* Punto de entrada principal de la aplicación (ruta '/'). 
  Este componente usualmente no renderiza UI visible, ya que la lógica en app/_layout.tsx maneja la redirección inicial
  basada en el estado de autenticación y controla la SplashScreen.
 */
import React from 'react';
// Opcional: Podrías mostrar un indicador de carga aquí si _layout tarda, generalmente es mejor dejar que _layout controle la SplashScreen.
// import IndicadorCarga from '../components/Common/LoadingIndicator'; //es lo que usaríamos para mostrar un loader aquí.

export default function PantallaIndice() {
  // Renderiza null o un componente de carga mínimo.
  // La redirección real es manejada por el useEffect en app/_layout.tsx.
  console.log("[IndexScreen] Renderizando pantalla índice (debería ser redirigido pronto).");
  return null;
  // Alternativa: return <IndicadorCarga />;
}
