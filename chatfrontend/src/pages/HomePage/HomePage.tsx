import {useEffect, useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import CustomAxios from "../../lib/actions/CustomAxios";
import {CurrentUserContext} from "../../lib/contexts/CurrentUserContext";
import {IUser} from "../../lib/types/User";

export default function HomePage(){
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const context = useContext(CurrentUserContext);
  const currentUser = context?.currentUser;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUsers = async () => {
      try{
        const {data} = await CustomAxios("get", "/users");
        const filteredUsers = data.filter((u: IUser) => u._id !== currentUser?._id);
        setUsers(filteredUsers);
      } catch (error){
        console.error("Failed to fetch users", error);
      } finally{
        setLoading(false);
      }
    };
    if (currentUser){
      fetchUsers();
    }
  }, [currentUser]);
  const handleStartChat = async (targetUserId: string) => {
    try{
      const {data} = await CustomAxios("post", "/chats", {
        userId: targetUserId,
      });
      navigate(`/chat/${data.chatId || data._id}`);
    } catch (error: any){
      if (error.response && error.response.status === 400){
        alert("You have already added this user to your contacts");
      } else{
        alert("Failed to start chat. Please try again.");
      }
    }
  };
  if (loading) return <div className="mt-20 flex justify-center p-10">Loading users...</div>;

  return(
    <div className="mt-20 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Discover Users</h1>
      <div className="flex flex-col gap-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No other users found.</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className="flex flex-row gap-8 items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-row items-center gap-4">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-lg">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleStartChat(user._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}