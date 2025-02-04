
FROM openjdk:17-jdk-slim
COPY target/viveroApp-0.0.1-SNAPSHOT.jar /app/viveroApp.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/viveroApp.jar"]

