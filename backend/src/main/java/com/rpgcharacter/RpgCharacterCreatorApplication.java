package com.rpgcharacter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class RpgCharacterCreatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(RpgCharacterCreatorApplication.class, args);
    }
}
