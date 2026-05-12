const crypto = require('crypto');

const {publicKey, privateKey} = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

console.log("Add these to .env (just copy paste)");
console.log(`JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`);
console.log(`JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);