# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Usar shell form para permitir substitución de variables de entorno
ENTRYPOINT java -Dspring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI} \
           -Dspring.data.mongodb.database=${SPRING_DATA_MONGODB_DATABASE} \
           -jar app.jar
