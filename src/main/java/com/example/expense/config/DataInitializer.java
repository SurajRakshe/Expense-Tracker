package com.example.expense.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.expense.entity.Category;
import com.example.expense.repository.CategoryRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        List<String> defaultCategories = Arrays.asList("Food", "Travel", "Health", "Investment");

        for (String name : defaultCategories) {
            if (!categoryRepository.existsByName(name)) {
                String type = name.equalsIgnoreCase("Investment") ? "INCOME" : "EXPENSE";
                Category category = new Category(null, name, type);
                categoryRepository.save(category);
                System.out.println("Inserted category: " + name + " (" + type + ")");
            } else {
                System.out.println("Category already exists: " + name);
            }
        }
    }
}