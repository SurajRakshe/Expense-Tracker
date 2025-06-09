package com.example.expense.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.expense.entity.Transaction;
import com.example.expense.repository.TransactionRepository;
import com.example.expense.services.TransactionService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
	
	private final TransactionService transactionService;

	 @Autowired
	    private TransactionRepository transactionRepository;

	    @GetMapping
	    public List<Transaction> getAllTransactions() {
	        return transactionRepository.findAll();
	    }

	    @GetMapping("/{id}")
	    public Optional<Transaction> getTransaction(@PathVariable Long id) {
	        return transactionRepository.findById(id);
	    }

	    @PostMapping
	    public Transaction createTransaction(@RequestBody Transaction transaction) {
	        return transactionRepository.save(transaction);
	    }

	    @PutMapping("/{id}")
	    public Transaction updateTransaction(@PathVariable Long id, @RequestBody Transaction updated) {
	        return transactionRepository.findById(id)
	            .map(txn -> {
	                txn.setDate(updated.getDate());
	                txn.setAmount(updated.getAmount());
	                txn.setDate(updated.getDate());
	                txn.setCategory(updated.getCategory());
	                return transactionRepository.save(txn);
	            }).orElseThrow(() -> new RuntimeException("Transaction not found"));
	    }

	    @DeleteMapping("/{id}")
	    public void deleteTransaction(@PathVariable Long id) {
	        transactionRepository.deleteById(id);
	    }
	}