package com.codejunc.exception;

public class LanguageNotSupportedException extends RuntimeException {
    public LanguageNotSupportedException(String message) {
        super(message);
    }
}
