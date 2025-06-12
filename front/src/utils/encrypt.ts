import CryptoJS from 'crypto-js'

const AES_KEY = 'llmadmin-aes-key'

/**
 * nonce와 비밀번호를 합쳐서 AES로 암호화하는 함수
 * 백엔드의 login_user 함수와 호환되는 형식으로 암호화합니다
 */
export const encryptWithNonce = (nonce: string, password: string): string => {
    // 1. nonce와 비밀번호 결합
    const plaintext = nonce + password;
    console.log('Combined plaintext length:', plaintext.length);

    // 2. 랜덤 IV 생성
    const iv = CryptoJS.lib.WordArray.random(16);

    // 3. AES 키를 WordArray로 변환
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);

    // 4. PKCS7 패딩과 함께 AES-CBC 암호화 수행
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    // 5. IV와 암호문 결합
    // IV를 바이트 배열로 가져오기
    const ivBytes = iv.clone();

    // 암호문을 바이트 배열로 가져오기
    const cipherBytes = encrypted.ciphertext;

    // IV와 암호문 바이트 배열 결합
    const combinedWords = CryptoJS.lib.WordArray.create();
    combinedWords.concat(ivBytes);
    combinedWords.concat(cipherBytes);

    // Base64로 인코딩하여 반환
    const base64Result = CryptoJS.enc.Base64.stringify(combinedWords);
    console.log('Encrypted result length:', base64Result.length);

    return base64Result;
}