import React, { useState } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Boton from '../Common/Button';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { KPI, KpiTrend } from '../../types';

interface KpiEditModalProps {
  visible: boolean;
  kpi: KPI;
  onCancel: () => void;
  onSubmit: (values: {
    value: number;
    unit: string;
    trend: KpiTrend;
    description: string;
  }) => Promise<void>;
}

export const KpiEditModal: React.FC<KpiEditModalProps> = ({
  visible,
  kpi,
  onCancel,
  onSubmit
}) => {
  const [value, setValue] = useState(kpi.value.toString());
  const [unit, setUnit] = useState(kpi.unit);
  const [trend, setTrend] = useState<KpiTrend>(kpi.trend);
  const [description, setDescription] = useState(kpi.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        value: Number(value),
        unit,
        trend,
        description
      });
    } catch (err: any) {
      setError(err.message || 'Error al actualizar KPI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal  visible={visible} transparent animationType="slide" onRequestClose={onCancel}>

      <Pressable 
    style={styles.overlay} 
    onPress={onCancel} // Click outside closes modal
  >
    <Pressable 
      style={styles.modalContainer}
      onPress={(e) => e.stopPropagation()} // Block event bubbling
    >
      <View style={[styles.overlay, { pointerEvents: 'box-none' }]}>
        <View style={styles.container}
          pointerEvents="box-none"
          onStartShouldSetResponder={() => true}
          >
          <Text style={styles.title}>Actualizar KPI: {kpi.name}</Text>
          
          <Text style={styles.label}>Valor</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Text style={styles.label}>Unidad</Text>
          <TextInput
            value={unit}
            onChangeText={setUnit}
            style={styles.input}
          />
          
          <Text style={styles.label}>Tendencia</Text>
          <Picker
            selectedValue={trend}
            onValueChange={(v) => setTrend(v as KpiTrend)}
            style={styles.input}
          >
            <Picker.Item label="↑ Ascendente" value="up" />
            <Picker.Item label="↓ Descendente" value="down" />
            <Picker.Item label="→ Estable" value="stable" />
          </Picker>
          
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, { height: 80 }]}
          />
          
          {error && <Text style={styles.error}>{error}</Text>}
          
          <View style={styles.buttons}>
            <Boton
              titulo="Cancelar"
              onPress={onCancel}
              variante="secundario"
              estiloContenedor={{ flex: 1 }}
            />
            <View style={{ width: 16 }} />
            <Boton
              titulo={loading ? "Guardando..." : "Guardar Nueva Versión"}
              onPress={handleSubmit}
              deshabilitado={loading}
              estiloContenedor={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
          </Pressable>
  </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%', // Or your desired width
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: 'transparent', // Critical - removes white background
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
    pointerEvents:'auto',
    overflow: 'hidden', // Critical for containing touches
  },
  content: {
    padding: Layout.spacing.large,
  },
  title: {
    fontSize: Layout.fontSize.heading,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.medium,
    color: Colors.primary,
  },
  label: {
    fontSize: Layout.fontSize.body,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.small,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.large,
    backgroundColor: Colors.white,
  },
  error: {
    color: Colors.danger,
    marginBottom: Layout.spacing.medium,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});