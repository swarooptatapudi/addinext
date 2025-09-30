// components/FileUploader.js
import axios from 'axios';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const response = await axios.post('/api/s3-presigned-url', {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      const presignedUrl = response.data.presignedUrl;

      await axios.put(presignedUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Share metadata with your backend API
      await axios.post('/api/share-metadata', {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      console.log('File uploaded successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
};

export default FileUploader;