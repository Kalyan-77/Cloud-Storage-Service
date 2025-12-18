import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

/* ================= CONFIG ================= */
const BACKEND_URL = "http://localhost:5000";

/* Socket must be OUTSIDE component */
const socket = io(BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"]
});

export default function Chat() {
  /* ================= STATE ================= */
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= GET SESSION USER ================= */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/auth/checkSession`,
          { withCredentials: true }
        );

        console.log("SESSION RESPONSE:", res.data);

        if (res.data.loggedIn) {
          setMe(res.data.user);
        }
      } catch (err) {
        console.error("Session fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  /* ================= GET USER LIST ================= */
  useEffect(() => {
    if (!me) return;

    axios.get(`${BACKEND_URL}/chat/users`, {
      withCredentials: true
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error("Users fetch error", err));
  }, [me]);

  /* ================= SOCKET RECEIVE ================= */
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      console.log("MESSAGE RECEIVED:", msg);
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("receive-message");
  }, []);

  /* ================= OPEN CHAT ================= */
  const openChat = async (otherUserId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/chat/room`,
        { otherUserId },
        { withCredentials: true }
      );

      const room = res.data._id;
      setRoomId(room);

      socket.emit("join-room", room);

      const msgs = await axios.get(
        `${BACKEND_URL}/chat/messages/${room}`,
        { withCredentials: true }
      );

      setMessages(msgs.data);
    } catch (err) {
      console.error("Open chat error", err);
    }
  };

  /* ================= SEND TEXT ================= */
  const sendMessage = () => {
    if (!roomId || !text.trim()) return;

    socket.emit("send-message", {
      roomId,
      text
    });

    setText("");
  };

  /* ================= SEND FILE ================= */
  const sendFile = async (file) => {
    if (!file || !roomId) return;

    const form = new FormData();
    form.append("file", file);
    form.append("roomId", roomId);

    try {
      await axios.post(
        `${BACKEND_URL}/chat/upload`,
        form,
        { withCredentials: true }
      );
    } catch (err) {
      console.error("File upload error", err);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="p-6 text-lg">
        Loading user session...
      </div>
    );
  }

  if (!me) {
    return (
      <div className="p-6 text-red-600">
        ❌ User not logged in
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen font-sans">

      {/* ================= USERS ================= */}
      <div className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="font-bold mb-3">Chats</h2>

        {users.length === 0 && (
          <p className="text-sm text-gray-500">
            No users found
          </p>
        )}

        {users.map(u => (
          <div
            key={u._id}
            onClick={() => openChat(u._id)}
            className="p-2 mb-1 rounded cursor-pointer hover:bg-gray-300"
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex flex-col w-3/4">

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {!roomId && (
            <p className="text-gray-500">
              Select a user to start chatting
            </p>
          )}

          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              <b>{m.sender?.name === me.name ? "You" : m.sender?.name}:</b>

              {m.type === "text" && (
                <span> {m.text}</span>
              )}

              {m.type === "image" && (
                <img
                  src={`${BACKEND_URL}${m.file.url}`}
                  alt=""
                  className="mt-1 max-w-xs"
                />
              )}

              {m.type === "video" && (
                <video
                  controls
                  className="mt-1 max-w-xs"
                  src={`${BACKEND_URL}${m.file.url}`}
                />
              )}

              {m.type === "audio" && (
                <audio
                  controls
                  src={`${BACKEND_URL}${m.file.url}`}
                />
              )}

              {m.type === "file" && (
                <a
                  href={`${BACKEND_URL}${m.file.url}`}
                  download
                  className="text-blue-600 underline ml-2"
                >
                  {m.file.name}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border p-2"
            placeholder="Type a message..."
          />

          <input
            type="file"
            onChange={(e) => sendFile(e.target.files[0])}
          />

          <button
            onClick={sendMessage}
            className="bg-green-600 text-white px-4"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
