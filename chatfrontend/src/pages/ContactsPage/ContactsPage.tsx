import {useEffect, useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import CustomAxios from "../../lib/actions/CustomAxios";
import {CurrentUserContext} from "../../lib/contexts/CurrentUserContext";
import {Chat} from "../../lib/types/Chat";
import {IUser} from "../../lib/types/User";

export default function ContactsPage(){
  const [contacts, setContacts] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const context = useContext(CurrentUserContext);
  const currentUser = context?.currentUser;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchContacts = async () => {
      try{
        const {data} = await CustomAxios("get", "/chats");
        setContacts(data);
      } catch (error){
        console.error("Failed to fetch contacts", error);
      } finally{
        setLoading(false);
      }
    };
    if (currentUser){
      fetchContacts();
    }
  }, [currentUser]);

  const getOtherParticipant = (participants: IUser[]) => {
    return participants.find((p) => p._id !== currentUser?._id);
  };
  if (loading) return <div className="flex justify-center p-10">Loading contacts...</div>;

  return(
    <div className="mt-20 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Contacts</h1>
      <div className="flex flex-col gap-4">
        {contacts.length === 0 ? (
          <p className="text-center text-gray-500">
            You don't have any active chats. Go to the Home page to chat with someone.
          </p>
        ) : (
          contacts.map((chat) => {
            const otherUser = getOtherParticipant(chat.participants);
            if (!otherUser) return null;
            return (
              <div 
                key={chat._id} 
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {otherUser.username ? otherUser.username.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{otherUser.username}</h3>
                  <p className="text-sm text-gray-400">Click to view conversation</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}