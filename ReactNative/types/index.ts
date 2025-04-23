//Archivo "barrel" para re-exportar todos los tipos desde el directorio types

// Exporta todos los tipos e interfaces de kpi.ts
export * from './kpi';

// Exporta todos los tipos e interfaces de user.ts
export * from './user';

// Exporta todos los tipos e interfaces de inventory.ts
export * from './inventory';

// Define and export TokenResponse
export type TokenResponse = {
    access_token: string;
    token_type: string;
};
