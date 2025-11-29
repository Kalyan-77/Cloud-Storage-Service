import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../../config';

const HomeCloud = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async () => {
        try {
            const res = await fetch(`${BASE_URL}/cloud/files`, {
                credentials: 'include'
            });
            const data = await res.json();
            setFiles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setFiles([]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert('Please choose a file first!');

        const formData = new FormData();
        formData.append('file', selectedFile);

        setLoading(true);
        try {
            await fetch(`${BASE_URL}/cloud/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            setSelectedFile(null);
            fetchFiles();
        } catch (err) {
            console.error('Error uploading file:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await fetch(`${BASE_URL}/cloud/files/${fileId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchFiles();
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">📂 Google Drive Manager</h2>

            <form onSubmit={handleUpload} className="mb-6 flex gap-3">
                <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="border p-2 rounded w-full"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            <div>
                <h3 className="text-xl font-semibold mb-2">Your Files</h3>
                {files.length === 0 ? (
                    <p className="text-gray-500">No files found.</p>
                ) : (
                    <ul className="space-y-3">
                        {files.map((file) => (
                            <li key={file.id} className="flex justify-between items-center border p-3 rounded">
                                <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {file.name}
                                </a>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HomeCloud;
