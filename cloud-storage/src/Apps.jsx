import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

/* ================= CONFIG ================= */
const BACKEND_URL = "http://localhost:5000";
import Loading from './Components/Loading';

/* Socket OUTSIDE component */
const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"]
});

export default function Chat() {
  /* ================= STATES ================= */
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  /* 🔥 NEW STATES */
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const typingTimeout = useRef(null);

  /* ================= SESSION ================= */
  useEffect(() => {
    axios.get(`${BACKEND_URL}/auth/checkSession`, { withCredentials: true })
      .then(res => {
        if (res.data.loggedIn) setMe(res.data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= USERS ================= */
  useEffect(() => {
    if (!me) return;
    axios.get(`${BACKEND_URL}/chat/users`, { withCredentials: true })
      .then(res => setUsers(res.data));
  }, [me]);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    /* RECEIVE MESSAGE */
    socket.on("receive-message", msg => {
      setMessages(prev => [...prev, msg]);

      // Auto mark seen if chat open
      if (roomId === msg.roomId && msg.sender?._id !== me?._id) {
        socket.emit("message-seen", { messageId: msg._id });
      }
    });

    /* SEEN UPDATE */
    socket.on("message-seen-update", ({ messageId, userId }) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? { ...m, seenBy: [...(m.seenBy || []), userId] }
            : m
        )
      );
    });

    /* ONLINE USERS */
    socket.on("online-users", ids => {
      setOnlineUsers(ids);
    });

    /* TYPING */
    socket.on("user-typing", ({ userId }) => {
      setTypingUser(userId);
    });

    socket.on("user-stop-typing", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-seen-update");
      socket.off("online-users");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [roomId, me]);

  /* ================= JOIN ROOM ================= */
  useEffect(() => {
    if (roomId) socket.emit("join-room", roomId);
  }, [roomId]);

  /* ================= OPEN CHAT ================= */
  const openChat = async (otherUserId) => {
    const roomRes = await axios.post(
      `${BACKEND_URL}/chat/room`,
      { otherUserId },
      { withCredentials: true }
    );

    setRoomId(roomRes.data._id);

    const msgs = await axios.get(
      `${BACKEND_URL}/chat/messages/${roomRes.data._id}`,
      { withCredentials: true }
    );

    setMessages(msgs.data);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    if (!roomId || !text.trim()) return;
    socket.emit("send-message", { roomId, text });
    setText("");
  };

  /* ================= TYPING HANDLER ================= */
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!roomId) return;

    socket.emit("typing", { roomId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId });
    }, 1200);
  };

  /* ================= UI STATES ================= */
  if (loading) return <div className="p-6"><Loading size="md" text="Loading..." /></div>;
  if (!me) return <div className="p-6 text-red-600">Login required</div>;

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen">

      {/* USERS */}
      <div className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="font-bold mb-3">Chats</h2>

        {users.map(u => (
  <div
    key={u._id}
    onClick={() => openChat(u._id)}
    className="p-2 cursor-pointer hover:bg-gray-300 flex justify-between items-center"
  >
    <span>{u.name}</span>

    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        onlineUsers.includes(u._id)
          ? "text-green-600"
          : "text-gray-400"
      }`}
    >
      ● {onlineUsers.includes(u._id) ? "Online" : "Offline"}
    </span>
  </div>
))}

      </div>

      {/* CHAT */}
      <div className="flex flex-col w-3/4">
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {!roomId && <p>Select a user</p>}

          {messages.map(m => (
  <div key={m._id} className="mb-1">
    <b>{m.sender?._id === me._id ? "You" : m.sender?.name}:</b>
    <span className="ml-1">{m.text}</span>

    {/* Delivered / Seen */}
    {m.sender?._id === me._id && (
      <span
        className={`ml-2 text-xs font-medium ${
          m.seenBy?.length
            ? "text-blue-600"
            : "text-gray-500"
        }`}
      >
        {m.seenBy?.length ? "Seen" : "Delivered"}
      </span>
    )}
  </div>
))}


          {/* TYPING */}
          {typingUser && (
            <p className="text-sm text-gray-500 mt-2">
              typing...
            </p>
          )}
        </div>

        {/* INPUT */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={handleTyping}
            className="flex-1 border p-2"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="bg-green-600 text-white px-4">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
