package com.rpgcharacter.exception;

/**
 * Base exception for all business logic errors.
 * Provides user-friendly error messages without exposing internal details.
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String message) {
        this(message, "BUSINESS_ERROR");
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String message, Throwable cause) {
        this(message, "BUSINESS_ERROR", cause);
    }

    public BusinessException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
