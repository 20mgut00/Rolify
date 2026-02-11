package com.rpgcharacter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.email.from}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Async
    public void sendVerificationEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify your email - RPG Character Creator");
            
            String verificationLink = frontendUrl + "/verify-email?token=" + token;
            
            String htmlContent = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #D9A441;">Welcome to RPG Character Creator!</h2>
                        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" 
                               style="background-color: #D9A441; 
                                      color: #0F2B3A; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Verify Email
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="%s" style="color: #D9A441;">%s</a>
                        </p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            This link will expire in 1 hour. If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(verificationLink, verificationLink, verificationLink);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
            log.info("Verification email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
    
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset your password - RPG Character Creator");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            String htmlContent = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #D9A441;">Password Reset Request</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" 
                               style="background-color: #D9A441; 
                                      color: #0F2B3A; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="%s" style="color: #D9A441;">%s</a>
                        </p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(resetLink, resetLink, resetLink);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
            log.info("Password reset email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
