package com.example.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.expense.repository")
@EntityScan(basePackages = "com.example.expense.entity")
public class ExpenceTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExpenceTrackerApplication.class, args);
	}

}
