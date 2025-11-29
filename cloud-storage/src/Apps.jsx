import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

const Apps = () => {
  const [musicFiles, setMusicFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusicFiles = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/cloud/files/category`, {
          params: { category: "music" },
        });
        setMusicFiles(response.data);
      } catch (err) {
        console.error("Error fetching music files:", err);
      }
      setLoading(false);
    };

    fetchMusicFiles();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading music files...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Music Files</h1>
      {musicFiles.length === 0 ? (
        <p>No music files found.</p>
      ) : (
        musicFiles.map((file) => (
          <div key={file.id} style={{ marginBottom: "20px" }}>
            <p>{file.name}</p>
            <audio controls style={{ width: "80%" }}>
              <source src={`${BASE_URL}/cloud/display/${file.id}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ))
      )}
    </div>
  );
};

export default Apps;
