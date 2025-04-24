#  Bienvenido al proyecto de tesis👋


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

   ```bash
   npx create-expo-app@latest 
   ```

   ## este es para el backend, por favor, recuerden añadir la información del .env. Por cuestiones de seguridad no se puede subir a Git, manejemoslo así
   ```bash
   pip install -r requirements.txt
   ```


2. Start the app

   ```bash
    npx expo start --clear 
   ```
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 
   ```

si les da algún error, ejecuten    
   ```bash
   npx expo-doctor   
   ```
   ```bash
   npm audit fix
   ```
   ```bash
   npm install axios expo-secure-store   
   ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
