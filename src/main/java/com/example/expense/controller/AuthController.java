package com.example.expense.controller;

import java.util.Collections;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expense.dto.AuthRequest;
import com.example.expense.dto.AuthResponse;
import com.example.expense.dto.RegisterRequest;
import com.example.expense.entity.User;
import com.example.expense.repository.UserRepository;
import com.example.expense.security.CustomUserDetailsService;
import com.example.expense.security.JwtUtil;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // ============ LOGIN ============

    /**
     * Authenticates the user using email and password.
     * Returns a JWT token if credentials are valid, or error if not.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            // Attempt authentication
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(), 
                    authRequest.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            // Authentication failed
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("error", "Invalid email or password"));
        }

        // Generate JWT token after successful authentication
        UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        String jwt = jwtUtil.generateToken(userDetails.getUsername());

        // Return token in response body
        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    // ============ REGISTER ============

    /**
     * Registers a new user if email is not already taken.
     * Returns a success message or error.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Collections.singletonMap("error", "Email already registered"));
        }

        // Create new user and hash password
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save user in database
        userRepository.save(user);

        // Return success response
        return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully"));
    }
}