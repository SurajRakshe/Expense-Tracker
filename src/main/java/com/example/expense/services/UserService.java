package com.example.expense.services;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.expense.entity.User;
import com.example.expense.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	
	 private final UserRepository userRepository;
	    private final PasswordEncoder passwordEncoder;

	    public User register(User user) {
	        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
	            throw new RuntimeException("Email already exists");
	        }
	        user.setPassword(passwordEncoder.encode(user.getPassword()));
	        return userRepository.save(user);
	    }

	    public Optional<User> findByEmail(String email) {
	        return userRepository.findByEmail(email);
	    }
	}


