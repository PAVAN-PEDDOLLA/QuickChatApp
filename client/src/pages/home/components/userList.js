import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import moment from "moment";

function UserList({ searchKey }) {
    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.userReducer);

    const dispatch = useDispatch();

    const startNewChat = async (searchedUserId) => {
        let response = null;
        try {
            dispatch(showLoader());
            response = await createNewChat([currentUser._id, searchedUserId]);
            dispatch(hideLoader());
            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                const updatedChat = [...allChats, newChat];
                dispatch(setAllChats(updatedChat));
            }
        } catch (error) {
            toast.error(response.message);
            dispatch(hideLoader());
        }
    }

    const openChat = (selectedUserId) => {
        const chat = allChats.find(chat =>
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(selectedUserId)
        )

        if (chat) {
            dispatch(setSelectedChat(chat));
        }
    }

    const isSelectedChat = (user) => {
        if (selectedChat) {
            return selectedChat.members.map(m => m._id).includes(user._id)
        }
        return false;
    }

    const getLastMessageTimeStamp = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if (!chat || !chat?.lastMessage) {
            return '';
        } else {
            return moment(chat?.lastMessage?.createdAt).format('hh:mm A');
        }
    }

    const getlastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if (!chat || !chat?.lastMessage) {
            return '';
        } else {
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return msgPrefix + chat?.lastMessage?.text?.substring(0, 25)
        }
    }

    const formatName = (user) => {
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;
    }

    const getUnreadMessageCount = (userId) => {
        const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));
        if (chat && chat.unreadMessageCount && chat.lastMessage.sender !== currentUser._id) {
            return <div className="unread-message-counter">{chat.unreadMessageCount}</div>
        } else {
            return '';
        }
    }

    return (
        allUsers
            .filter(user => {
                return (
                    (
                        user.firstname.toLowerCase().includes(searchKey.toLowerCase()) || user.lastname.toLowerCase().includes(searchKey.toLowerCase())
                    ) && searchKey
                ) || (allChats.find(chat => chat.members.map(m => m._id).includes(user._id)))
            })
            .map(user => {
                return <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                    <div className={isSelectedChat(user) ? "selected-user" : "filtered-user"}>
                        <div className="filter-user-display">
                            {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className="user-profile-image" />}
                            {!user.profilePic && <div
                                className={isSelectedChat(user) ? "user-selected-avatar" : "user-default-avatar"}>
                                {
                                    user.firstname.charAt(0).toUpperCase() +
                                    user.lastname.charAt(0).toUpperCase()
                                }
                            </div>}
                            <div className="filter-user-details">
                                <div className="user-display-name">
                                    {formatName(user)}
                                </div>
                                <div className="user-display-email">{getlastMessage(user._id) || user.email}</div>
                            </div>
                            <div>
                                {getUnreadMessageCount(user._id)}
                                <div className="last-message-timestamp">{getLastMessageTimeStamp(user._id)}</div>
                            </div>
                            {!allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                                <div className="user-start-chat">
                                    <button className="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
                                        Start Chat
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            })
    )
}

export default UserList;