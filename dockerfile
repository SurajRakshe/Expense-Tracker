# ——— Build stage ———
FROM maven:3.8.5-openjdk-8 AS build

WORKDIR /app

# Download dependencies first (layer caching)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Add source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ——— Runtime stage ———
FROM eclipse-temurin:8-jre-alpine

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from previous stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown appuser:appgroup /app/app.jar
USER appuser

EXPOSE 8181

ENTRYPOINT ["java", "-jar", "app.jar"]
