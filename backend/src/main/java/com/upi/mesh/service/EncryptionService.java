package com.upi.mesh.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Hybrid encryption service using AES-256-GCM + RSA-OAEP.
 * Flow: Generate AES key → Encrypt payload with AES-GCM → Encrypt AES key with RSA public key.
 */
@Service
@Slf4j
public class EncryptionService {

    private static final String AES_ALGORITHM = "AES/GCM/NoPadding";
    private static final String RSA_ALGORITHM = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int AES_KEY_SIZE = 256;
    private static final int RSA_KEY_SIZE = 2048;

    private KeyPair rsaKeyPair;

    public EncryptionService() {
        this.rsaKeyPair = generateRsaKeyPair();
    }

    /**
     * Encrypts a plaintext payload using hybrid AES-GCM + RSA-OAEP encryption.
     * Returns a map with: encryptedPayload, encryptedAesKey, iv
     */
    public Map<String, String> encryptPayload(String plaintext) throws Exception {
        // Generate random AES-256 key
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(AES_KEY_SIZE, new SecureRandom());
        SecretKey aesKey = keyGen.generateKey();

        // Generate random IV for GCM
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);

        // Encrypt payload with AES-GCM
        Cipher aesCipher = Cipher.getInstance(AES_ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        aesCipher.init(Cipher.ENCRYPT_MODE, aesKey, parameterSpec);
        byte[] encryptedPayload = aesCipher.doFinal(plaintext.getBytes("UTF-8"));

        // Encrypt AES key with RSA public key
        Cipher rsaCipher = Cipher.getInstance(RSA_ALGORITHM);
        rsaCipher.init(Cipher.ENCRYPT_MODE, rsaKeyPair.getPublic());
        byte[] encryptedAesKey = rsaCipher.doFinal(aesKey.getEncoded());

        Map<String, String> result = new HashMap<>();
        result.put("encryptedPayload", Base64.getEncoder().encodeToString(encryptedPayload));
        result.put("encryptedAesKey", Base64.getEncoder().encodeToString(encryptedAesKey));
        result.put("iv", Base64.getEncoder().encodeToString(iv));
        return result;
    }

    /**
     * Decrypts a hybrid-encrypted payload using RSA private key + AES-GCM.
     */
    public String decryptPayload(String encryptedPayload, String encryptedAesKey, String iv) throws Exception {
        // Decrypt AES key using RSA private key
        Cipher rsaCipher = Cipher.getInstance(RSA_ALGORITHM);
        rsaCipher.init(Cipher.DECRYPT_MODE, rsaKeyPair.getPrivate());
        byte[] aesKeyBytes = rsaCipher.doFinal(Base64.getDecoder().decode(encryptedAesKey));
        SecretKey aesKey = new SecretKeySpec(aesKeyBytes, "AES");

        // Decrypt payload using AES-GCM
        Cipher aesCipher = Cipher.getInstance(AES_ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, Base64.getDecoder().decode(iv));
        aesCipher.init(Cipher.DECRYPT_MODE, aesKey, parameterSpec);
        byte[] decryptedBytes = aesCipher.doFinal(Base64.getDecoder().decode(encryptedPayload));

        return new String(decryptedBytes, "UTF-8");
    }

    /**
     * Computes SHA-256 hash of the given data.
     */
    public String computeHash(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(hash);
    }

    /**
     * Computes SHA-256 hash as hex string.
     */
    public String computeHashHex(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes("UTF-8"));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public String getPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(rsaKeyPair.getPublic().getEncoded());
    }

    private KeyPair generateRsaKeyPair() {
        try {
            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
            keyPairGen.initialize(RSA_KEY_SIZE, new SecureRandom());
            return keyPairGen.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate RSA key pair", e);
        }
    }
}
