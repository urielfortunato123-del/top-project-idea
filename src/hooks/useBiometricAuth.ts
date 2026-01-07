import { useState, useEffect, useCallback } from 'react';

// Check if WebAuthn is supported
const isWebAuthnSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
};

// Check if platform authenticator (biometric) is available
const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

// Generate a random challenge
const generateChallenge = (): ArrayBuffer => {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge.buffer as ArrayBuffer;
};

// Convert ArrayBuffer to Base64 URL safe string
const bufferToBase64URL = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Convert Base64 URL safe string to ArrayBuffer
const base64URLToBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
};

interface StoredCredential {
  credentialId: string;
  email: string;
  password: string; // Encrypted or hashed in production
  createdAt: number;
}

const STORAGE_KEY = 'obraphoto_biometric_credentials';

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isPlatformAuthenticatorAvailable();
      setIsAvailable(available);
      
      // Check if there's a registered credential
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsRegistered(!!stored);
      
      setIsLoading(false);
    };
    
    checkAvailability();
  }, []);

  // Register biometric credential after successful login
  const registerBiometric = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isAvailable) return false;
    
    try {
      const challenge = generateChallenge();
      const userId = new TextEncoder().encode(email);
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'ObraPhoto',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: email,
          displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Use device biometric
          userVerification: 'required',
          residentKey: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential info locally
        const storedCredential: StoredCredential = {
          credentialId: bufferToBase64URL(credential.rawId),
          email,
          password: btoa(password), // Base64 encode (use proper encryption in production)
          createdAt: Date.now(),
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCredential));
        setIsRegistered(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }, [isAvailable]);

  // Authenticate using biometric
  const authenticateWithBiometric = useCallback(async (): Promise<{ email: string; password: string } | null> => {
    if (!isAvailable || !isRegistered) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const storedCredential: StoredCredential = JSON.parse(stored);
      const challenge = generateChallenge();
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: base64URLToBuffer(storedCredential.credentialId),
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (assertion) {
        // Biometric verified, return stored credentials
        return {
          email: storedCredential.email,
          password: atob(storedCredential.password),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  }, [isAvailable, isRegistered]);

  // Remove registered biometric
  const removeBiometric = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsRegistered(false);
  }, []);

  // Get registered email
  const getRegisteredEmail = useCallback((): string | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const storedCredential: StoredCredential = JSON.parse(stored);
      return storedCredential.email;
    } catch {
      return null;
    }
  }, []);

  return {
    isAvailable,
    isRegistered,
    isLoading,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
    getRegisteredEmail,
  };
}
