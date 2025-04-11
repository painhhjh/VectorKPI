//Define la interfaz para el objeto de usuario. Representa los datos básicos de un usuario autenticado.

export interface Usuario {
    id: string | number; // Identificador único del usuario
    email: string; // Correo electrónico del usuario
    nombre?: string; // Nombre del usuario (opcional)
    // Puedes añadir más campos según lo que devuelva la API (roles, permisos, etc.)
    // roles?: string[];
  }