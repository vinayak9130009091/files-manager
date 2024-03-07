// client/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

import { FcFolder } from "react-icons/fc";
import { FcOpenedFolder } from "react-icons/fc";
function App() {
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch the list of folders and their files when the component mounts
    const fetchFolderData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/folders");
        setFolderData(response.data);
      } catch (error) {
        console.error("Error fetching folder data:", error);
      }
    };

    fetchFolderData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (folder) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`http://localhost:5000/upload/${folder}`, formData);
      alert("File uploaded successfully!");
      // After upload, fetch the updated list of folders and their files
      const response = await axios.get("http://localhost:5000/folders");
      setFolderData(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const [folderName, setFolderName] = useState("");

  const handleInputChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post("http://localhost:5000/createFolder", {
        folderName: folderName,
      });

      console.log("Folder created successfully");
      fetchAllFolders();
    } catch (error) {
      console.error("Error creating folder:", error.response.data.error);
    }
  };
  const [folderData, setFolderData] = useState([]);
  const fetchAllFolders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/allFolders");
      setFolderData(response.data.folders);
    } catch (error) {
      console.error("Error fetching all folders:", error.response.data.error);
    }
  };

  useEffect(() => {
    fetchAllFolders();
  }, []);
  const handleDeleteFile = async (folder, file) => {
    try {
      await axios.delete(`http://localhost:5000/deleteFile/${folder}/${file}`);
      console.log("File deleted successfully");
      // You may want to update the state to reflect the changes immediately
    } catch (error) {
      console.error("Error deleting file:", error.response.data.error);
    }
  };

  const handleDownloadFile = async (folder, file) => {
    try {
      const response = await fetch(`http://localhost:5000/download/${folder}/${file}`);
      const blob = await response.blob(); // Corrected this line

      // Create an anchor element and trigger a download
      const url = window.URL.createObjectURL(blob);

      // Create an anchor element and trigger a download
      const a = document.createElement("a");
      a.href = url;

      // Use the actual filename from the server response
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const suggestedFilename = filenameMatch ? filenameMatch[1] : file;

      a.download = suggestedFilename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error.response.data.error);
    }
  };

  const handleDeleteFolder = async (folder) => {
    try {
      // Send a request to the server to delete the folder
      await axios.post("http://localhost:5000/deleteFolder", { folderName: folder });
      fetchAllFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      // Handle error, show an alert, etc.
    }
  };
  const [expandedFolders, setExpandedFolders] = useState([]);

  const toggleFolder = (folder) => {
    setExpandedFolders((prevExpanded) => {
      const isExpanded = prevExpanded.includes(folder);
      return isExpanded ? prevExpanded.filter((f) => f !== folder) : [...prevExpanded, folder];
    });
  };
  const handleDownloadFolder = async (folder) => {
    try {
      await axios
        .get(`http://localhost:5000/download/${folder}`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const a = document.createElement("a");
          a.href = url;
          a.download = `${folder}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };

  const [folder, setFolder] = useState(null); // Add folder state
  const [files, setFiles] = useState([]); // Use an array to store multiple files

  const handleUploadFolder = async () => {
    if (folderName.trim() === "" || files.length === 0) {
      alert("Please enter a folder name and select a folder.");
      return;
    }

    const formData = new FormData();

    // Append each file to the FormData object
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    try {
      await axios.post(`http://localhost:5000/uploadFolder/${folderName}`, formData);
      alert("Folder uploaded successfully!");
    } catch (error) {
      console.error("Error uploading folder:", error);
    }
  };

  const handleFolderChange = (e) => {
    setFolder(e.target.files[0]);
  };

  const handleUploadFolderWithFacility = async () => {
    if (folderName.trim() === "" || !folder) {
      alert("Please enter a folder name and select a folder.");
      return;
    }

    const formData = new FormData();
    formData.append("folder", folder);

    try {
      await axios.post(`http://localhost:5000/uploadFolder/${folderName}`, formData);
      alert("Folder uploaded successfully!");
    } catch (error) {
      console.error("Error uploading folder:", error);
    }
  };

  return (
    <div>
      <div>
        <input type="file" directory="" webkitdirectory="" onChange={handleFolderChange} />
        <input type="text" placeholder="Enter folder name" value={folderName} onChange={handleInputChange} />
        <button onClick={handleUploadFolderWithFacility}>Upload Folder</button>
        <div>
          <input type="text" placeholder="Enter folder name" value={folderName} onChange={handleInputChange} />
          <button onClick={handleCreateFolder}>Create Folder</button>
        </div>
      </div>
      <div>
        <h2>All Folders and Their Files</h2>
        {folderData.map((folder, index) => (
          <div key={index}>
            <h3>
              <button style={{ background: "none", color: "inherit", border: "none", padding: 0, font: "inherit", cursor: "pointer", outline: "inherit" }} onClick={() => toggleFolder(folder.folder)}>
                {expandedFolders.includes(folder.folder) ? <FcOpenedFolder /> : <FcFolder />}
              </button>
              {folder.folder}
              <button onClick={() => handleDeleteFolder(folder.folder)}>Delete Folder</button>
              <button onClick={() => handleDownloadFolder(folder.folder)}>Download Folder</button>
            </h3>
            {expandedFolders.includes(folder.folder) && (
              <ul>
                {folder.files.map((file, fileIndex) => (
                  <li key={fileIndex}>
                    {file}
                    <button onClick={() => handleDeleteFile(folder.folder, file)}>Delete</button>
                    <button onClick={() => handleDownloadFile(folder.folder, file)}>Download</button>
                  </li>
                ))}
              </ul>
            )}
            <input type="file" onChange={(e) => handleFileChange(e)} />
            <button onClick={() => handleUpload(folder.folder)}>Upload to {folder.folder}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
