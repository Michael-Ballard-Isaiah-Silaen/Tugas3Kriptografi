import {useEffect, useState, useContext, useRef, FormEvent} from "react";
import {useParams, useNavigate} from "react-router-dom";
import CustomAxios from "../../lib/actions/CustomAxios";
import {CurrentUserContext} from "../../lib/contexts/CurrentUserContext";
import {IMessage} from "../../lib/types/Message";

export default function ChatPage(){
  const {chatId} = useParams<{chatId: string}>();
  const navigate = useNavigate();
  const context = useContext(CurrentUserContext);
  const currentUser = context?.currentUser;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchMessages = async () => {
      try{
        const {data} = await CustomAxios("get", `/messages/${chatId}`);
        setMessages(data);
      } catch (error){
        console.error("Failed to fetch messages", error);
        alert("Unable to load conversation or unauthorized.");
        navigate("/contacts");
      } finally{
        setLoading(false);
      }
    };
    if (chatId){
      fetchMessages();
    }
  }, [chatId, navigate]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    try{
      const {data} = await CustomAxios("post", "/messages", {
        chatId,
        content: newMessage,
      });
      const newMsgObj: IMessage = {
        _id: data.messageId,
        chatId: chatId as string,
        senderId: currentUser._id,
        content: newMessage,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMsgObj]);
      setNewMessage("");
    } catch (error){
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again.");
    }
  };
  if (loading) return <div className="flex justify-center p-10">Loading conversation...</div>;

  return (
    <div className="mt-20 max-w-3xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white border-b p-4 flex items-center shadow-sm rounded-t-lg">
        <button 
          onClick={() => navigate("/contacts")}
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          &larr; Back to Contacts
        </button>
        <h2 className="text-lg font-bold">Conversation</h2>
      </div>
      <div className="flex-1 bg-gray-50 overflow-y-auto p-4 border-x flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-auto">
            No messages yet. Say hello!
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
                  }`}
                >
                  {msg.content}
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
            placeholder="Type a message..."
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