// ReactNative/components/Auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import CampoEntrada from '../Common/InputField'; // Usar CampoEntrada
import Boton from '../Common/Button'; // Usar Boton
import MensajeError from '../Common/ErrorMessage'; // Usar MensajeError
import CargandoIndicador from '../Common/LoadingIndicator'; // Usar CargandoIndicador
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout'; // Importar Layout para estilos consistentes

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => void;
  cargando: boolean; // Usar cargando
  error: string | null;
}

const FormularioRestablecerPassword: React.FC<ResetPasswordFormProps> = ({ onSubmit, cargando, error }) => {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorPasswordLocal, setErrorPasswordLocal] = useState<string | null>(null);

  const manejarSubmit = () => {
    setErrorPasswordLocal(null);
    if (!nuevaPassword || !confirmarPassword) {
      setErrorPasswordLocal('Ambos campos de contraseña son obligatorios.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPasswordLocal('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword.length < 8) {
      setErrorPasswordLocal('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    onSubmit(nuevaPassword);
  };

  return (
    <View style={estilos.contenedor}>
      <CampoEntrada
        etiqueta="Nueva Contraseña"
        placeholder="Ingresa tu nueva contraseña"
        value={nuevaPassword}
        onChangeText={setNuevaPassword}
        secureTextEntry
        error={errorPasswordLocal ?? undefined}
        editable={!cargando}
      />
      <CampoEntrada
        etiqueta="Confirmar Contraseña"
        placeholder="Confirma tu nueva contraseña"
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
        secureTextEntry
        error={errorPasswordLocal ?? undefined}
        editable={!cargando}
      />
      {error && <MensajeError mensaje={error} />}
      <Boton
        titulo="Restablecer Contraseña"
        onPress={manejarSubmit}
        deshabilitado={cargando}
        cargando={cargando}
        estiloContenedor={estilos.boton}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    width: '100%',
    paddingHorizontal: Layout.spacing.medium, // Usar Layout.spacing
  },
  boton: {
    marginTop: Layout.spacing.large, // Usar Layout.spacing
    backgroundColor: Colors.primary, // Usar Colors
  },
});

export default FormularioRestablecerPassword;
