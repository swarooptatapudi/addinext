// pages/api/share-metadata.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { fileName, fileType } = req.body;

    // Process metadata here
    console.log(`File uploaded: ${fileName} (${fileType})`);

    res.status(200).json({ message: 'Metadata shared successfully!' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}