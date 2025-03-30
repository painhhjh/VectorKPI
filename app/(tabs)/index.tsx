import { Text, Image, View, Pressable } from "react-native";
import { Link } from 'expo-router';
import { styles, COLORS } from "../../styles/auth.styles"; // Cambia la ruta de importación
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.title}>Te quiero, ma</Text>
        <Ionicons name="heart" size={24} color="#e74c3c" />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://m.media-amazon.com/images/S/pv-target-images/dc064b8caab3091db0362fcbea0662889c2e26116959c3d47a6b946169d87172.jpg",
          }}
          style={styles.image}
        />
      </View>

      <Link href="/notificaciones" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ver notificaciones</Text>
          <Ionicons name="notifications-outline" size={20} color="white" />
        </Pressable>
      </Link>
    </View>
  );
}