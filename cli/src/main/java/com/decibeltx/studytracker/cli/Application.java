package com.decibeltx.studytracker.cli;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
@Configuration
@PropertySource("defaults.properties")
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
