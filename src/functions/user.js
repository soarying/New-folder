const crypto = require("node:crypto");
const dotenv = require("dotenv");
dotenv.config();

const algorithm = process.env.ENCRYPT_ALGORITHM;
if (!algorithm) {
  throw new Error(
    "Encryption algorithm is not defined in the environment variables."
  );
}

const key = crypto
  .createHash("sha256")
  .update(String(process.env.encryptSecret))
  .digest();

const encrypt = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      const encryptedData = iv.toString("hex") + ":" + encrypted;
      resolve(encryptedData);
    } catch (error) {
      reject(error);
    }
  });
};

const decrypt = async (encryptedData) => {
  return new Promise((resolve, reject) => {
    try {
      const textParts = encryptedData.split(":");
      const iv = Buffer.from(textParts.shift(), "hex");
      const encryptedText = textParts.join(":");
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      resolve(decrypted);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { encrypt, decrypt };
