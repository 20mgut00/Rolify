package com.rpgcharacter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final ObjectMapper objectMapper;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.resend-api-key}")
    private String resendApiKey;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    public void sendVerificationEmail(String to, String token) {
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

        sendEmail(to, "Verify your email - RPG Character Creator", htmlContent);
        log.info("Verification email sent to: {}", to);
    }

    public void sendPasswordResetEmail(String to, String token) {
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

        sendEmail(to, "Reset your password - RPG Character Creator", htmlContent);
        log.info("Password reset email sent to: {}", to);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html
            );

            String body = objectMapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                log.error("Resend API error: status={}, body={}", response.statusCode(), response.body());
                throw new RuntimeException("Email API error: " + response.statusCode() + " - " + response.body());
            }

            log.info("Resend API response: status={}", response.statusCode());

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
