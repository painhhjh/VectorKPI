// ReactNative/types/user.ts

export interface Usuario {
  id: string | number; // Identificador único del usuario
  email: string; // Correo electrónico del usuario
  profile: {
    full_name: string; // Reflects the backend response
  };
  isActive: boolean; // Indica si el usuario está activo
  created_at: Date; // Fecha de creación del usuario
  updatedAt?: Date; // Fecha de última actualización del usuario (opcional)
}

export interface LoginCredentials {
  username: string; // Email
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string | null;
}

// Nuevo: Interfaz para la solicitud de restablecimiento de contraseña
export interface PasswordResetRequest {
  email: string;
}

// Nuevo: Interfaz para el restablecimiento de contraseña
export interface UserPasswordReset {
  token: string;
  new_password: string;
}
