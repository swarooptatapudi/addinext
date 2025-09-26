import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.Access_key_ID,
  secretAccessKey: process.env.Secret_access_key,
  region: 'ap-south-1', // Replace with your desired region
});
export default s3;