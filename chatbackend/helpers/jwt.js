const crypto = require("crypto");

const base64urlEncode = (str) => {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const base64urlDecode = (str) => {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
};

const sign = (claims, privateKey) => {
  const header = { alg: "ES256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(claims));
  const signInput = `${encodedHeader}.${encodedPayload}`;
  const signObj = crypto.createSign("SHA256");
  signObj.update(signInput);
  signObj.end();
  const signature = signObj.sign(privateKey);
  const encodedSignature = signature
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signInput}.${encodedSignature}`;
};

const verify = (jwt, publicKey, options = {}) => {
  if (typeof jwt !== "string" || jwt.split(".").length !== 3){
    throw new Error("Invalid JWT format");
  }
  const [encodedHeader, encodedPayload, encodedSignature] = jwt.split(".");
  let header, payload;
  try{
    header = JSON.parse(base64urlDecode(encodedHeader));
    payload = JSON.parse(base64urlDecode(encodedPayload));
  } catch (err){
    throw new Error("Failed parsing JWT JSON");
  }
  if (options.algs && !options.algs.includes(header.alg)){
    throw new Error(`Algorithm ${header.alg} not permitted`);
  }
  let hashAlg = "SHA256";
  if (header.alg === "ES384") hashAlg = "SHA384";
  if (header.alg === "ES512") hashAlg = "SHA512";
  const verifyInput = `${encodedHeader}.${encodedPayload}`;
  const verifyObj = crypto.createVerify(hashAlg);
  verifyObj.update(verifyInput);
  verifyObj.end();
  const signature = Buffer.from(
    encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );
  const isValid = verifyObj.verify(publicKey, signature);
  if (!isValid){
    throw new Error("Invalid signature");
  }
  const now = Math.floor(Date.now() / 1000);
  if(!options.ignoreExp && payload.exp && payload.exp < now){
    throw new Error("Token expired");
  }
  if(!options.ignoreNbf && payload.nbf && payload.nbf > now){
    throw new Error("Token not yet valid");
  }
  if(options.iss && payload.iss !== options.iss){
    throw new Error("Invalid issuer");
  }
  if(options.sub && payload.sub !== options.sub){
    throw new Error("Invalid subject");
  }
  if(options.aud && payload.aud !== options.aud){
    throw new Error("Invalid audience");
  }
  if(options.jti && payload.jti !== options.jti){
    throw new Error("Invalid jti");
  }
  return {header, payload, signature: encodedSignature};
};

const getToken = (payload) => {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  if (!privateKey) throw new Error("Server JWT_PRIVATE_KEY not found");
  const claims = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  return sign(claims, privateKey.replace(/\\n/g, "\n"));
};

const getPayload = (token) => {
  const publicKey = process.env.JWT_PUBLIC_KEY;
  if (!publicKey) throw new Error("Server missing JWT_PUBLIC_KEY");
  const decoded = verify(token, publicKey.replace(/\\n/g, "\n"), { algs: ["ES256"] });
  return decoded.payload;
};

module.exports = { sign, verify, getToken, getPayload };