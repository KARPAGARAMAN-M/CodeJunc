# ========================================================
# Stage 1: Build stage using Eclipse Temurin JDK 21
# ========================================================
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven wrapper and project definition first for dependency layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Ensure Linux executable permissions and convert line endings if created on Windows
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw

# Pre-fetch dependencies to leverage Docker layer caching
RUN ./mvnw dependency:go-offline -B || true

# Copy application source code
COPY src ./src

# Package production executable JAR without running tests
RUN ./mvnw clean package -DskipTests

# ========================================================
# Stage 2: Runtime stage using lightweight Eclipse Temurin JRE 21
# ========================================================
FROM eclipse-temurin:21-jre-jammy AS runner

# Create a non-root group and user for secure container execution
RUN groupadd -r codejunc && useradd -r -g codejunc -d /app -s /sbin/nologin codejunc

WORKDIR /app

# Copy the built executable jar from builder stage
COPY --from=builder /build/target/codejunc-backend-1.0.0.jar /app/app.jar

# Set ownership to non-root user
RUN chown -R codejunc:codejunc /app

# Use non-root user
USER codejunc

# Support Render PORT environment variable with 8080 default
ENV PORT=8080
EXPOSE 8080

# Configure JVM flags and launch application
ENTRYPOINT ["sh", "-c", "exec java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
