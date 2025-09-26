"use client";

import { useState } from "react";

interface PresignedResponse {
  status: boolean;
  message: string;
  statusCode: number;
  data: {
    uploadUrl: string;
    key: string;
  };
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Request presigned URL from Flask backend
      const presignedRes = await fetch("http://localhost:3001/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: "12345", // Replace with logged-in user's ID
        }),
      });

      const result: PresignedResponse = await presignedRes.json();
      if (!result.status) throw new Error("Failed to get presigned URL");

      // 2. Upload file directly to S3 with progress tracking
      await uploadFileToS3(result.data.uploadUrl, file);

      const body = JSON.stringify({
        key: result.data.key,
        size: file.size,
        type: file.type,
        originalName: file.name,
      });

      console.log("Uploaded", body);




      // 3. Send metadata to backend (optional)
      // await fetch("http://localhost:3001/save-metadata", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     key: result.data.key,
      //     size: file.size,
      //     type: file.type,
      //     originalName: file.name,
      //   }),
      // });

      alert("✅ Upload complete");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("❌ Upload failed. Check console for details.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Function to upload file to S3 with progress bar
  const uploadFileToS3 = async (url: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  };

  return (
    <main className="flex flex-col gap-4 items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold">Upload a File</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {uploading && (
        <div className="w-64 bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        disabled={uploading}
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? `Uploading... ${progress}%` : "Upload"}
      </button>
    </main>
  );
}
