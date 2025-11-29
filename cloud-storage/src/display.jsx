import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

const DisplayImage = ({ fileId }) => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!fileId) return;

      try {
        const response = await axios.get(`${BASE_URL}/display/${fileId}`, {
          responseType: "blob", // important for images
        });

        setImageData(URL.createObjectURL(response.data));
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    fetchImage();
  }, [fileId]);

  if (!imageData) return <p>Loading image...</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <img src={imageData} alt="file" style={{ maxWidth: "100%" }} />
    </div>
  );
};

export default DisplayImage;
