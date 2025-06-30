//Pantalla de Configuración.Muestra información del usuario y permite cerrar sesión. hay que corregir
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal } from 'react-native'; // Importa Alert
import { useAuth } from '../../contexts/useAuth'; // Ajusta la ruta
import Boton from '../../components/Common/Button'; // Ajusta la ruta
import Colors from '../../constants/Colors'; // Ajusta la ruta
import Layout from '../../constants/Layout'; // Ajusta la ruta
import { actualizarUsuario, obtenerUsuarioActual } from '@/services/authService';
import CampoEntrada from '@/components/Common/InputField';
import MensajeError from '@/components/Common/ErrorMessage';

export default function PantallaConfiguracion() {
  // Obtiene datos y función de logout del contexto actualizado
  const { usuario, logout, estado, actualizarUsuario } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: usuario?.email || '',
    full_name: usuario?.profile?.full_name || '',
    password: '', // Password field starts empty
  });
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // La navegación a la pantalla de login es manejada por app/_layout.tsx al detectar
      // el cambio de estado a 'noAutenticado'.
      console.log('[SettingsScreen] Cierre de sesión iniciado.');
    } catch (error: any) {
      console.error('[SettingsScreen] Error al cerrar sesión:', error);
      // Muestra un mensaje de error al usuario si falla el proceso
      Alert.alert('Error', `No se pudo cerrar la sesión completamente: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      setError('El email es obligatorio');
      return;
    }
    setCargando(true);
    try {
        await actualizarUsuario({
        email: formData.email,
        password: formData.password || undefined,
        profile: { full_name: formData.full_name },
        });
        setModalVisible(false); 
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información del Usuario</Text>
        {usuario ? (
          <>
            {/* Muestra nombre si existe, si no, muestra 'No disponible' */}
            <Text style={estilos.textoInfo}>
                Nombre: {usuario.profile?.full_name || 'No disponible'}
            </Text>
            <Text style={estilos.textoInfo}>Email: {usuario.email}</Text>
            <Text style={estilos.textoInfo}>ID: {usuario.id}</Text>
            {/* Añade más información del usuario si está disponible */}
          </>
        ) : (
          // Muestra un mensaje si el usuario es null (podría pasar brevemente durante logout)
          <Text style={estilos.textoInfo}>Cargando información...</Text>
        )}
      </View>

      <Boton 
        titulo="Editar Perfil" 
        onPress={() => setModalVisible(true)} 
        variante="secundario"
      />

      <View style={estilos.seccion}>
        <Boton
          titulo="Cerrar Sesión"
          onPress={handleLogout}
          variante="peligro" // Botón rojo para logout
          // Deshabilita el botón mientras el estado de AuthContext sea 'cargando'
          deshabilitado={estado === 'cargando-login'}
          cargando={estado === 'cargando-login'} // Muestra spinner si está en proceso
          estiloContenedor={estilos.botonLogout}
        />
      </View>

      {/* Puedes añadir más secciones de configuración aquí */}
      {/*
      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Preferencias</Text>
        // ... controles de configuración ...
      </View>
      */}


      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.modalTitulo}>Editar Perfil</Text>
            
            {error && <MensajeError mensaje={error} />}

            <CampoEntrada
              etiqueta="Nombre Completo"
              value={formData.full_name}
              onChangeText={(text) => setFormData({...formData, full_name: text})}
            />

            <CampoEntrada
              etiqueta="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />

            <CampoEntrada
              etiqueta="Nueva Contraseña (opcional)"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />

            <View style={estilos.modalBotones}>
              <Boton 
                titulo="Cancelar" 
                onPress={() => setModalVisible(false)} 
                variante="secundario" 
              />
              <Boton 
                titulo={cargando ? "Guardando..." : "Guardar"} 
                onPress={handleSubmit} 
                deshabilitado={cargando}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.medium,
  },
  seccion: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
    marginBottom: Layout.spacing.large,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: Layout.fontSize.heading,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Layout.spacing.small,
  },
  textoInfo: {
    fontSize: Layout.fontSize.body,
    color: Colors.text,
    marginBottom: Layout.spacing.small,
    lineHeight: Layout.fontSize.body * 1.5,
  },
  botonLogout: {
    // Estilos adicionales para el botón si son necesarios
  },

   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
  },
  modalTitulo: {
    fontSize: Layout.fontSize.heading,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.medium,
    color: Colors.primary,
  },
  modalBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.medium,
  },
});
