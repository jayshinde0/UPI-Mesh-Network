package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.service.EncryptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/encryption")
@RequiredArgsConstructor
@Tag(name = "Encryption", description = "Encryption visualization endpoints")
@SecurityRequirement(name = "bearerAuth")
public class EncryptionController {

    private final EncryptionService encryptionService;

    @PostMapping("/encrypt")
    @Operation(summary = "Encrypt a payload (demo)")
    public ResponseEntity<ApiResponse<Map<String, String>>> encrypt(
            @RequestBody Map<String, String> body) throws Exception {
        String plaintext = body.getOrDefault("plaintext", "{}");
        Map<String, String> result = encryptionService.encryptPayload(plaintext);
        result.put("originalLength", String.valueOf(plaintext.length()));
        result.put("encryptedLength", String.valueOf(result.get("encryptedPayload").length()));
        return ResponseEntity.ok(ApiResponse.success(result, "Payload encrypted"));
    }

    @PostMapping("/decrypt")
    @Operation(summary = "Decrypt a payload (demo)")
    public ResponseEntity<ApiResponse<Map<String, String>>> decrypt(
            @RequestBody Map<String, String> body) throws Exception {
        String decrypted = encryptionService.decryptPayload(
            body.get("encryptedPayload"),
            body.get("encryptedAesKey"),
            body.get("iv")
        );
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("decryptedPayload", decrypted), "Payload decrypted"));
    }

    @PostMapping("/hash")
    @Operation(summary = "Compute SHA-256 hash")
    public ResponseEntity<ApiResponse<Map<String, String>>> hash(
            @RequestBody Map<String, String> body) throws Exception {
        String data = body.getOrDefault("data", "");
        String hash = encryptionService.computeHashHex(data);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("hash", hash, "algorithm", "SHA-256"), "Hash computed"));
    }

    @GetMapping("/public-key")
    @Operation(summary = "Get RSA public key")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicKey() {
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("publicKey", encryptionService.getPublicKeyBase64(),
                   "algorithm", "RSA-2048",
                   "encryptionScheme", "OAEP-SHA256")));
    }
}
