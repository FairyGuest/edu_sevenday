import React, { useMemo, useState } from "react";
import smCrypto from "sm-crypto";

/** SM2 登录密码加密公钥 */
export const SM2_PUBLIC_KEY =
  "0433a4f285911ee2576648a97e93c8247bfe3e5afa41a28ec1188614c075acb3479348a0ad04809d9d90790c167efa32d5ac1ba41bde569144ffdc903b0b20e033";

/**
 * sm2 加密方法
 * @param data
 * @returns {*}
 */
export function encrypt(data: string) {
  try {
    return smCrypto.sm2.doEncrypt(data, SM2_PUBLIC_KEY, 0);
  } catch {
    return "";
  }
}

export const PUBLIC_KEY_SPKI_BASE64 =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2YqCupOFSH3KCeSL7sn8N/3UBoA84TY6yGUJV9lAe57Tn0+S9rysVFHgSIDIqcxBYIehVzShUpwbgLgPGbR5YJ2tx1ALqn0vZd6VQJpzzjpxAM6Cd0BiqnHV3OzJg7btzTpv3EsNHnkZZTTPY4Y4Cn3EFblfSfoJaWzqo/hhacIb03EgvQKBDlo7xQ8gVnX4MSDUYrVeEKMqmCI/IFueZFvud8gONmglKa7VleR3WieUfaal6P7Pko+lng/CmGY4o9hQ86CA4HoLVeGhv4te8mwxBxHwF89Y4SFsPvlbNYfe6NblSGVTFIwldhRADQ1u09csax3OI6mV6Lgeasj1nwIDAQAB"; //  前端公钥内容

function stripWhitespace(s) {
  return (s || "").replace(/\s+/g, "");
}

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let bin = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(bin);
}

function base64UrlFromBytes(bytes) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomBase64Url(bytesLen = 16) {
  const bytes = new Uint8Array(bytesLen);
  crypto.getRandomValues(bytes);
  return base64UrlFromBytes(bytes);
}

function randomAlphaNum6() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[bytes[i] % chars.length];
  return s;
}

async function importRsaOaepPublicKey(spkiBase64) {
  const clean = stripWhitespace(spkiBase64);
  const der = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

/**
 * purpose: "login"
 * 返回：v1.<base64url密文>（直接塞进原 password 字段）
 */
export async function encryptPasswordToV1(
  passwordPlain,
  purpose,
  spkiBase64 = PUBLIC_KEY_SPKI_BASE64,
) {
  const pubKey = await importRsaOaepPublicKey(spkiBase64);
  const ts = Math.floor(Date.now() / 1000);
  const nonce = randomBase64Url(16);

  const pwd = randomAlphaNum6() + passwordPlain + randomAlphaNum6();
  const payload = { pwd, ts, nonce, purpose };
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    pubKey,
    plaintext,
  );
  const cipherBytes = new Uint8Array(cipherBuf);
  return { payload, passwordField: "v1." + base64UrlFromBytes(cipherBytes) };
}
