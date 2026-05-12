export interface IMessage {
  _id: string;
  chatId: string;
  senderId: string;
  ciphertext: string;
  iv: string;
  mac?: string;
  timestamp: string;
  decryptedContent?: string;
  decryptionFailed?: boolean;
}