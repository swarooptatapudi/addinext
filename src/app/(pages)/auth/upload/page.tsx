"use client";

import { Field } from "formik";
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
 const baseUrl='https://uaterp.addiwise.com/api/:path*'
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    setUploading(true);
    setProgress(0);

    try {
      // 1. Request presigned URL from Flask backend
      const presignedRes = await fetch("https://uaterp.addiwise.com/api/method/addiwise.apis.utils.generate_presigned_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: "1", // Replace with logged-in user's ID
        }),
      });

      const result: PresignedResponse = await presignedRes.json();
      if (!result.status) throw new Error("Failed to get presigned URL");

      // 2. Upload file directly to S3 with progress tracking

      ///  use this function with aysnc and wait ok in stl file picker page or s3 predigned url pasge ?
      // in submit event handler .  do it when you submit form.  first ok now understoo so i need to do it for bk and insole also 
      // do it same ok anna 
      // disconnecting now ok 
      await uploadFileToS3(result.data.uploadUrl, file);

      const body = JSON.stringify({
        key: result.data.key,
        size: file.size,
        type: file.type,
        originalName: file.name,
      });

      // console.log("Uploaded", body);

      // Here you uploading multiple file right and asking backend pre signed url separately for each file  ? yes the only chnages i ahve is url only...
      // are you storeing uploaded details in array like 
      //  i tried got issue so stopped reached u
      // in api result sai givign filename righ tand locationtiiiiion  

      // store in array like    
      // uploaded_files = [
      //   {"key": "uploads/user_1/file1.txt", "size": 12345, "type": "text/plain", "originalName": "file1.txt" },
      //   { "key": "uploads/user_1/file2.jpg", "size": 67890, "type": "image/jpeg", "originalName": "file2.jpg" }
      // ]

      // adn encode this result to base64encdoe and give in multiple form Field.  sai decode his side and store in db 
      // got it   ?  hello vunava una anna ....
      // give above array in ecodeed forat and add in multpart form and send in backend api (maybe insole order )


      // where you sending this data to backend ?ok wait 



      // 3. Send metadata to backend (optional)
      // await fetch("http://localhost:3001/save-metadata", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     key: result.data.key,
      //     size: file.size,
      //     type: file.type,
      //     originalName: file.name, 
      3
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
// const handleUpload = async () => {.

//   if (!file) {
//     alert("Please select a file first");
//     return;
//   }
//   setUploading(true);
//   setProgress(0);

//   try {
//     const presignedRes = await fetch(
//       "https://uaterp.addiwise.com/api/method/addiwise.apis.utils.generate_presigned_url",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fileName: file.name,
//           fileType: file.type,
//           userId: "1", // replace with actual userId
//         }),
//       }
//     );

//     if (!presignedRes.ok) {
//       throw new Error(`Backend returned ${presignedRes.status}`);
//     }

//     const response = await presignedRes.json();
//     if (!response?.message?.status) throw new Error("Failed to get presigned URL");

//     const { uploadUrl, key } = response.message.data;

//     await uploadFileToS3(uploadUrl, file);
//     console.log("✅ Uploaded:", { key, size: file.size });

//     alert("✅ Upload complete!");
//   } catch (error) {
//     console.error("Upload failed:", error);
//     alert("❌ Upload failed. Check console for details.");
//   } finally {
//     setUploading(false);
//     setProgress(0);
//   }
// };


// const uploadFileToS3 = async (uploadUrl: string, file: File) => {
//   return new Promise<void>((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.open("PUT", uploadUrl, true);
//     xhr.setRequestHeader("Content-Type", file.type); // required for S3 PUT
//     xhr.upload.onprogress = (e) => {
//       if (e.lengthComputable) {
//         const percent = Math.round((e.loaded / e.total) * 100);
//         setProgress(percent);
//       }
//     };
//     xhr.onload = () => (xhr.status === 200 ? resolve() : reject(xhr.statusText));
//     xhr.onerror = () => reject("Network error during upload");
//     xhr.send(file);
//   });
// };

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
