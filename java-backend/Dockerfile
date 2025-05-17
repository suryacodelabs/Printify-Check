
# Build stage
FROM eclipse-temurin:24-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src/ src/

# Build the application with optimizations for production
RUN ./mvnw package -DskipTests -Pproduction

# Runtime stage
FROM eclipse-temurin:24-jre

# Add JVM tuning for container environment and ARM architecture
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 \
               -XX:+UseZGC -XX:+ZGenerational -XX:+UseStringDeduplication \
               -XX:+ExitOnOutOfMemoryError \
               -XX:+HeapDumpOnOutOfMemoryError \
               -XX:HeapDumpPath=/app/logs/heapdump.hprof \
               -Djava.security.egd=file:/dev/./urandom"

# Install Tesseract OCR and other dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    tesseract-ocr-eng \
    tesseract-ocr-fra \
    tesseract-ocr-deu \
    tesseract-ocr-spa \
    tesseract-ocr-ita \
    ghostscript \
    mupdf-tools \
    fonts-liberation \
    curl \
    # Additional language support for broader use
    tesseract-ocr-chi-sim \
    tesseract-ocr-chi-tra \
    tesseract-ocr-jpn \
    tesseract-ocr-rus \
    tesseract-ocr-ara \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy JAR file from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create directories for file storage
RUN mkdir -p /app/uploads /app/processed /app/logs /app/temp /app/cache

# Set environment variables
ENV PDF_UPLOAD_DIR=/app/uploads
ENV PDF_PROCESSED_DIR=/app/processed
ENV TESSDATA_PATH=/usr/share/tesseract-ocr/4.00/tessdata
ENV TEMP_DIR=/app/temp
ENV LOG_DIR=/app/logs
ENV CACHE_DIR=/app/cache
ENV APP_ENV=production

# Create non-root user for running the application
RUN groupadd -r printifyuser && useradd -r -g printifyuser printifyuser
RUN chown -R printifyuser:printifyuser /app

# Expose the API port
EXPOSE 8080

# Switch to non-root user
USER printifyuser

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
