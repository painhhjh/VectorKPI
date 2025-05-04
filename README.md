#  Bienvenido al proyecto de tesis👋


## Empezar

1. Instalen las dependencias

   ```bash
   npm install
   ```

  # no recuerdo bien si cuando descargen el proyecto les va a venir el expo instalado, pero si con el npm install no bastó, ejecutan este
   ```bash
   npx create-expo-app@latest 
   ```

   ## este es para el backend
   ```bash
   pip install -r requirements.txt
   ```

   ## tienen que instalar postgresql y subir la base de datos via pgadmin4

   # antes de seguir, por favor añadan el .env no lo subo por cuestiones de seguridad


2. Ejecutar la app
   
   # primero abren la base de datos, luego el backend y luego el front end
   
  # back
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 
   ```
   # front
   ```bash
    npx expo start --clear 
   ```

   # al ejecuar el expo start pueden probar la aplicación en su teléfono y en el navegador http://127.0.0.1:8000/usuarios/iniciar_sesion/
   # para probar la app en su teléfono tienen que instalar expo go y seguir los pasos
   # Nunca modifiquen manualmente la estructura de la BD fuera de Alembic
   # Ejecuten alembic upgrade head siempre después de generar una migración
   


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

## Aprende más

Para aprender más sobre cómo desarrollar tu proyecto con Expo, consulta los siguientes recursos:
- [Documentación de Expo](https://docs.expo.dev/): Aprende los fundamentos o profundiza en temas avanzados con nuestras [guías](https://docs.expo.dev/guides).
- [Tutorial de aprendizaje de Expo](https://docs.expo.dev/tutorial/introduction/): Sigue un tutorial paso a paso donde crearás un proyecto que funciona en Android, iOS y la web.