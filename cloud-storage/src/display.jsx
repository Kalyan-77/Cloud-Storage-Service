import { useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function Profile({ me, onClose, onUpdate }) {
  const [name, setName] = useState(me.name);
  const [about, setAbout] = useState(me.about || "");
  const [file, setFile] = useState(null);

  const saveProfile = async () => {
    const form = new FormData();
    form.append("name", name);
    form.append("about", about);
    if (file) form.append("avatar", file);

    const res = await axios.put(
      `${BACKEND_URL}/profile/update`,
      form,
      { withCredentials: true }
    );

    onUpdate(res.data);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-white z-50 p-4">
      <h2 className="font-bold text-lg mb-4">Profile</h2>

      <div className="flex flex-col items-center mb-4">
        <img
          src={me.avatar ? `${BACKEND_URL}${me.avatar}` : "https://via.placeholder.com/100"}
          className="w-24 h-24 rounded-full mb-2"
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <div className="mb-3">
        <label className="text-sm">Name</label>
        <input
          className="w-full border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="text-sm">About</label>
        <textarea
          className="w-full border p-2"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
      </div>

      <button
        onClick={saveProfile}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={onClose}
        className="ml-2 text-gray-600"
      >
        Cancel
      </button>
    </div>
  );
}
