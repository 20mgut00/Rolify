package com.rpgcharacter.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Slf4j
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri:${MONGODB_URI:mongodb://localhost:27017}}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:${MONGODB_DATABASE:rpg-characters}}")
    private String database;

    @Override
    protected String getDatabaseName() {
        log.info("MongoDB Database: {}", database);
        return database;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        log.info("Creating MongoClient with URI: {}", maskPassword(mongoUri));

        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();

        return MongoClients.create(mongoClientSettings);
    }

    private String maskPassword(String uri) {
        // Oculta la contraseña en los logs para seguridad
        return uri.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }
}
