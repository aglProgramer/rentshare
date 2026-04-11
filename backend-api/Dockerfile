# Paso 1: Compilar la aplicación
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copiamos solo el pom primero para cachear dependencias
COPY pom.xml .
RUN mvn dependency:go-offline
# Luego el código y compilamos saltando tests obligatoriamente
COPY src ./src
RUN mvn clean package -DskipTests

# Paso 2: Ejecutar la aplicación
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Importante: Render usa el puerto que él quiera, lo forzamos a 8080 internamente
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "app.jar"]
