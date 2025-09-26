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
      const response = await axios.post('/method/addiwise.apis.order_types.bk_order.create_bk_order', {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      const presignedUrl = response.data.presignedUrl;
      console.log('Presigned URL:', presignedUrl);

      await axios.put(presignedUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Share metadata with your backend API
      await axios.post('/method/ad diwise.apis.order_types.bk_order.create_bk_order', {
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