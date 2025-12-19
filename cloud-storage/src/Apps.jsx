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
  /* ================= PROFILE STATE ================= */
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [profileAbout, setProfileAbout] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  /* ================= CHAT STATE ================= */
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
        if (res.data.loggedIn) setMe(res.data.user);
      } catch (err) {
        console.error("Session fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!me) return;

    axios.get(`${BACKEND_URL}/profile/me`, {
      withCredentials: true
    })
    .then(res => {
      setProfile(res.data);
      setProfileName(res.data.name);
      setProfileAbout(res.data.about || "");
    })
    .catch(err => console.error("Profile fetch error", err));
  }, [me]);

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
    socket.on("receive-message", msg => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("message-deleted", ({ messageId }) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? { ...m, deletedForEveryone: true }
            : m
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-deleted");
    };
  }, []);

  /* ================= ALWAYS JOIN ROOM ================= */
  useEffect(() => {
    if (roomId) socket.emit("join-room", roomId);
  }, [roomId]);

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    const form = new FormData();
    form.append("name", profileName);
    form.append("about", profileAbout);
    if (profileFile) form.append("avatar", profileFile);

    const res = await axios.put(
      `${BACKEND_URL}/profile/update`,
      form,
      { withCredentials: true }
    );

    setProfile(res.data);
    setMe(res.data);
    setShowProfile(false);
  };

  /* ================= OPEN CHAT ================= */
  const openChat = async (otherUserId) => {
    const res = await axios.post(
      `${BACKEND_URL}/chat/room`,
      { otherUserId },
      { withCredentials: true }
    );

    setRoomId(res.data._id);

    const msgs = await axios.get(
      `${BACKEND_URL}/chat/messages/${res.data._id}`,
      { withCredentials: true }
    );

    setMessages(msgs.data);
  };

  /* ================= SEND TEXT ================= */
  const sendMessage = () => {
    if (!roomId || !text.trim()) return;
    socket.emit("send-message", { roomId, text });
    setText("");
  };

  /* ================= SEND FILE ================= */
  const sendFile = async (file) => {
    if (!file || !roomId) return;
    const form = new FormData();
    form.append("file", file);
    form.append("roomId", roomId);
    await axios.post(`${BACKEND_URL}/chat/upload`, form, {
      withCredentials: true
    });
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteForMe = async (id) => {
    await axios.delete(`${BACKEND_URL}/chat/message/me/${id}`, {
      withCredentials: true
    });
    setMessages(prev => prev.filter(m => m._id !== id));
  };

  const deleteForEveryone = async (id) => {
    await axios.delete(`${BACKEND_URL}/chat/message/everyone/${id}`, {
      withCredentials: true
    });
  };

  /* ================= DELETE CHAT ================= */
  const deleteChat = async () => {
    if (!roomId) return;
    await axios.delete(`${BACKEND_URL}/chat/chat/me/${roomId}`, {
      withCredentials: true
    });
    setMessages([]);
    setRoomId(null);
  };

  /* ================= UI STATES ================= */
  if (loading) return <div className="p-6">Loading...</div>;
  if (!me) return <div className="p-6 text-red-600">Login required</div>;

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen font-sans relative">

      {/* PROFILE PANEL */}
      {showProfile && profile && (
        <div className="absolute inset-0 bg-white z-50 flex">
          <div className="w-1/3 border-r p-6">
            <h2 className="font-bold text-lg mb-4">My Profile</h2>

            <img
              src={profile.avatar ? `${BACKEND_URL}${profile.avatar}` : "https://via.placeholder.com/120"}
              className="w-28 h-28 rounded-full mb-3"
            />

            <input type="file" onChange={e => setProfileFile(e.target.files[0])} />

            <button
              onClick={() => setShowProfile(false)}
              className="mt-4 text-gray-600"
            >
              ← Back
            </button>
          </div>

          <div className="flex-1 p-6">
            <label>Name</label>
            <input
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full border p-2 mb-4"
            />

            <label>About</label>
            <textarea
              value={profileAbout}
              onChange={e => setProfileAbout(e.target.value)}
              className="w-full border p-2 mb-4"
            />

            <label>Email</label>
            <input
              value={profile.email}
              disabled
              className="w-full border p-2 bg-gray-100 mb-4"
            />

            <button
              onClick={saveProfile}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* USERS */}
      <div className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="font-bold mb-3 flex justify-between">
          Chats
          <button
            onClick={() => setShowProfile(true)}
            className="text-blue-600 text-sm"
          >
            My Profile
          </button>
        </h2>

        {roomId && (
          <button onClick={deleteChat} className="text-red-600 text-sm mb-2">
            Delete Chat
          </button>
        )}

        {users.map(u => (
          <div
            key={u._id}
            onClick={() => openChat(u._id)}
            className="p-2 rounded cursor-pointer hover:bg-gray-300"
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex flex-col w-3/4">
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {!roomId && <p>Select a user to start chatting</p>}

          {messages.map(m => (
            <div
              key={m._id}
              onContextMenu={(e) => {
                e.preventDefault();
                const c = window.prompt("1 = Delete for me\n2 = Delete for everyone");
                if (c === "1") deleteForMe(m._id);
                if (c === "2" && m.sender?._id === me._id) deleteForEveryone(m._id);
              }}
            >
              <b>{m.sender?.name === me.name ? "You" : m.sender?.name}:</b>

              {m.deletedForEveryone ? (
                <i className="ml-2 text-gray-500">Message deleted</i>
              ) : (
                <>
                  {m.type === "text" && <span> {m.text}</span>}
                  {m.type === "image" && <img src={`${BACKEND_URL}${m.file.url}`} className="max-w-xs mt-1" />}
                  {m.type === "video" && <video controls src={`${BACKEND_URL}${m.file.url}`} className="max-w-xs mt-1" />}
                  {m.type === "audio" && <audio controls src={`${BACKEND_URL}${m.file.url}`} />}
                  {m.type === "file" && (
                    <a href={`${BACKEND_URL}${m.file.url}`} download className="text-blue-600 ml-2">
                      {m.file.name}
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 border p-2"
            placeholder="Type a message..."
          />

          <input type="file" onChange={e => sendFile(e.target.files[0])} />

          <button onClick={sendMessage} className="bg-green-600 text-white px-4">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
