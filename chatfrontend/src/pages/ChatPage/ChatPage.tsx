import {useEffect, useState, useContext, useRef, FormEvent} from "react";
import {useParams, useNavigate} from "react-router-dom";
import CustomAxios from "../../lib/actions/CustomAxios";
import {CurrentUserContext} from "../../lib/contexts/CurrentUserContext";
import {IMessage} from "../../lib/types/Message";

const toBase64 = (buffer: ArrayBuffer) => window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
const fromBase64 = (base64: string) => Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));

async function importPublicKey(base64Key: string){
  return await window.crypto.subtle.importKey(
    "spki",
    fromBase64(base64Key),
    {name: "ECDH", namedCurve: "P-256"},
    true,
    []
  );
}
async function importPrivateKey(rawBuffer: ArrayBuffer){
  return await window.crypto.subtle.importKey(
    "pkcs8",
    rawBuffer,
    {name: "ECDH", namedCurve: "P-256"},
    true,
    ["deriveBits"]
  );
}
async function calculateSharedSecret(myPrivateKey: CryptoKey, opponentPublicKey: CryptoKey){
  return await window.crypto.subtle.deriveBits(
    {name: "ECDH", public: opponentPublicKey},
    myPrivateKey,
    256
  );
}
async function deriveAESKeyHKDF(sharedSecretBits: ArrayBuffer){
  const hkdfKeyMaterial = await window.crypto.subtle.importKey(
    "raw", sharedSecretBits, {name: "HKDF"}, false, ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info: new Uint8Array(), 
    },
    hkdfKeyMaterial,
    {name: "AES-GCM", length: 256},
    false, ["encrypt", "decrypt"]
  );
}
async function deriveMACKeyHKDF(sharedSecretBits: ArrayBuffer){
  const hkdfKeyMaterial = await window.crypto.subtle.importKey(
    "raw", sharedSecretBits, {name: "HKDF"}, false, ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: "HKDF", hash: "SHA-256", salt: new Uint8Array(), info: new TextEncoder().encode("mac-key"),
    },
    hkdfKeyMaterial,
    {name: "HMAC", hash: "SHA-256", length: 256},
    false, ["sign", "verify"]
  );
}
async function calculateMAC(ciphertextB64: string, ivB64: string, key: CryptoKey){
  const data = ciphertextB64 + ivB64;
  const encoded = new TextEncoder().encode(data);
  const signature = await window.crypto.subtle.sign("HMAC", key, encoded);
  return toBase64(signature);
}
async function encryptMessageText(text: string, key: CryptoKey){
  const encoded = new TextEncoder().encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {name: "AES-GCM", iv: iv},
    key,
    encoded
  );
  return {ciphertext: toBase64(ciphertextBuffer), iv: toBase64(iv)};
}
async function decryptMessageText(ciphertextB64: string, ivB64: string, key: CryptoKey){
  const ciphertext = fromBase64(ciphertextB64);
  const iv = fromBase64(ivB64);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {name: "AES-GCM", iv: iv},
    key,
    ciphertext
  );
  return new TextDecoder().decode(decryptedBuffer);
}

export default function ChatPage(){
  const {chatId} = useParams<{chatId: string}>();
  const navigate = useNavigate();
  const context = useContext(CurrentUserContext);
  const currentUser = context?.currentUser;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharedKeys, setSharedKeys] = useState<{aes: CryptoKey, mac: CryptoKey} | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupKeys = async () => {
      try{
        if (!currentUser) return;
        if (!currentUser.decryptedPrivateKey){
          alert("Session secured parameters lost because you reload the page. Please login again to decrypt your private key.");
          navigate("/auth/sign-in");
          return;
        }
        const {data: chatData} = await CustomAxios("get", `/chats/${chatId}`);
        const opponentId = chatData.participants.find((p: string) => p !== currentUser._id);
        if (!opponentId) throw new Error("Could not identify opponent");
        const {data: opponentData} = await CustomAxios("get", `/users/${opponentId}/public-key`);
        const myPrivKey = await importPrivateKey(currentUser.decryptedPrivateKey);
        const opponentPubKey = await importPublicKey(opponentData.publicKey);
        const sharedSecret = await calculateSharedSecret(myPrivKey, opponentPubKey);
        const aesKey = await deriveAESKeyHKDF(sharedSecret);
        const macKey = await deriveMACKeyHKDF(sharedSecret);
        setSharedKeys({aes: aesKey, mac: macKey});
      } catch (error){
        console.error("Key exchange failed:", error);
        alert("Secure key exchange failed.");
        navigate("/contacts");
      }
    };
    if (chatId){
      setupKeys();
    }
  }, [chatId, currentUser, navigate]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const fetchAndDecryptMessages = async (isInitialFetch = false) => {
      if (!sharedKeys) return;
      try{
        const {data} = await CustomAxios("get", `/messages/${chatId}`);
        const decryptedMessages: IMessage[] = await Promise.all(
          data.map(async (msg: IMessage) => {
            try{
              if (!msg.mac) throw new Error("Missing MAC");
              const expectedMac = await calculateMAC(msg.ciphertext, msg.iv, sharedKeys.mac);
              if (expectedMac !== msg.mac){
                return {
                  ...msg, 
                  decryptedContent: "MAC Verification Failed", 
                  decryptionFailed: true
                };
              }
              const plainText = await decryptMessageText(msg.ciphertext, msg.iv, sharedKeys.aes);
              return {...msg, decryptedContent: plainText, decryptionFailed: false};
            } catch (err: any){
              const errorText = err.message === "Missing MAC" ? "Missing MAC" : "[Encrypted Message / Decryption Failed]";
              return {...msg, decryptedContent: errorText, decryptionFailed: true};
            }
          })
        );
        setMessages((prev) => {
          if (prev.length === decryptedMessages.length){
            if (prev.length === 0) return prev;
            if (prev[prev.length - 1]._id === decryptedMessages[decryptedMessages.length - 1]._id){
              return prev;
            }
          }
          return decryptedMessages;
        });
      } catch (error){
        console.error("Failed to fetch messages", error);
        if (isInitialFetch){
          alert("Unable to load conversation or unauthorized.");
          navigate("/contacts");
        }
      } finally{
        setLoading(false);
      }
    };
    fetchAndDecryptMessages(true);
    intervalId = setInterval(() => fetchAndDecryptMessages(false), 1000);
    return () => clearInterval(intervalId);
  }, [chatId, navigate, sharedKeys]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !sharedKeys) return;
    try{
      const {ciphertext, iv} = await encryptMessageText(newMessage, sharedKeys.aes);
      const mac = await calculateMAC(ciphertext, iv, sharedKeys.mac);
      const {data} = await CustomAxios("post", "/messages", {
        chatId,
        ciphertext,
        iv,
        mac
      });
      const newMsgObj: IMessage = {
        _id: data.messageId,
        chatId: chatId as string,
        senderId: currentUser._id,
        ciphertext,
        iv,
        mac,
        timestamp: new Date().toISOString(),
        decryptedContent: newMessage, 
        decryptionFailed: false
      };
      setMessages((prev) => [...prev, newMsgObj]);
      setNewMessage("");
    } catch (error){
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again.");
    }
  };
  if (loading) return <div className="flex justify-center p-10 mt-20">Establishing secure connection & loading messages...</div>;
  return (
    <div className="mt-20 max-w-3xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white border-b p-4 flex items-center shadow-sm rounded-t-lg">
        <button 
          onClick={() => navigate("/contacts")}
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          &larr; Back to Contacts
        </button>
        <h2 className="text-lg font-bold">End-to-End Encrypted Chat</h2>
      </div>
      <div className="flex-1 bg-gray-50 overflow-y-auto p-4 border-x flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-auto flex flex-col items-center">
            <span>No messages yet.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?._id;
            return (
              <div 
                key={msg._id} 
                className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
              >
                <div 
                  className={`px-4 py-2 rounded-2xl ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-white border text-gray-800 rounded-bl-none shadow-sm"
                  } ${msg.decryptionFailed ? "border-red-500 bg-red-100 text-red-700 font-semibold" : ""}`}
                >
                  {msg.decryptedContent}
                </div>
                <span className="text-xs text-gray-400 mt-1 mx-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 border rounded-b-lg shadow-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}