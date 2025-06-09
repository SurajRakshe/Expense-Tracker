package com.example.expense.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.expense.repository.CategoryRepository;

@Service
public class CategoryService {


    @Autowired
    private CategoryRepository categoryRepository;

    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }

}
