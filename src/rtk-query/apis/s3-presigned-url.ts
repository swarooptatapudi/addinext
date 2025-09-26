import { NextApiRequest, NextApiResponse } from 'next';
// Assuming 'aws-config' exports a configured AWS.S3 instance
import s3 from '../../../aws-config'; 

// Define the expected structure of the request body for type safety
interface PresignedUrlRequestBody {
  fileName: string;
  fileType: string;
}

// Define a type for the handler function, using NextApiRequest and NextApiResponse
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Cast req.body to the defined interface for type-safe destructuring
    const { fileName, fileType } = req.body as PresignedUrlRequestBody;

    // A basic check to ensure the body contains the required fields
    if (!fileName || !fileType) {
        return res.status(400).json({ message: 'Missing fileName or fileType in request body' });
    }

    const params = {
      Bucket: 'addiwse-tech', // Replace with your bucket name
      Key: fileName,
      ContentType: fileType,
      // You may want to add Expires: 60 * 5, (for 5 minutes) for security
    };

    try {
      // Use the proper logging function: console.log
      // We are calling a method on the S3 instance that returns a Promise,
      // which is correctly typed if 'aws-config' is set up properly.
      const presignedUrl: string = await s3.getSignedUrlPromise('putObject', params);
      console.log('Presigned URL:', presignedUrl); 

      res.status(200).json({ presignedUrl });
    } catch (error) {
      // It's good practice to ensure we log a meaningful error
      console.error('Error generating presigned URL:', error);
      res.status(500).json({ message: 'Error generating presigned URL' });
    }
  } else {
    // Explicitly set the allowed header for better API practice
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}