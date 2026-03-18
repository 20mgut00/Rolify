package com.rpgcharacter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
// @EnableScheduling para el cron de reset de rate limiting, @EnableMongoAuditing para @CreatedDate/@LastModifiedDate
@EnableMongoAuditing
@EnableAsync
@EnableScheduling
public class RpgCharacterCreatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(RpgCharacterCreatorApplication.class, args);
    }
}
