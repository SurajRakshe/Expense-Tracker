package com.example.expense.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.expense.entity.Transaction;
import com.example.expense.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

	
	private final TransactionRepository transactionRepository;

    public Transaction addTransaction(Transaction t) {
        return transactionRepository.save(t);
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}

