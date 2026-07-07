// // use this file for base url for all places - IMPORTANT change this for production
// export const getBaseUrl = () => {
//     return 'https://uaterp.addiwise.com';
//
// }
//
// export function getDownloadUrl(filePath?: string) {
//   if (!filePath) return '';
//
//   // ✅ already proxied → return as-is
//   if (filePath.startsWith('/api/method/addiwise.apis.order_types.utils.file_utils.proxy_s3')) {
//     return `${getBaseUrl()}${filePath}`;
//   }
//
//   // ✅ raw uploads key → proxy it
//   if (filePath.startsWith('uploads/')) {
//     return `${getBaseUrl()}api/method/addiwise.apis.order_types.utils.file_utils.proxy_s3?key=${encodeURIComponent(filePath)}`;
//   }
//
//   // ✅ already absolute (fallback)
//   if (filePath.startsWith('http')) {
//     return filePath;
//   }
//
//   return '';
// }
//

// use this file for base url for all places - IMPORTANT change this for production
export const getBaseUrl = () => {
  // always return WITHOUT trailing slash
  return 'https://uaterp.addiwise.com';
};

export function getDownloadUrl(filePath?: string) {
  if (!filePath) return '';

  const base = getBaseUrl().replace(/\/+$/, '');

  // ✅ already full URL
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // ✅ already proxied (with or without leading slash)
  if (filePath.includes('/api/method/addiwise.apis.order_types.utils.file_utils.proxy_s3')) {
    const normalized = filePath.startsWith('/')
      ? filePath
      : `/${filePath}`;
    return `${base}${normalized}`;
  }

  // ✅ raw uploads key → proxy it
  if (filePath.startsWith('uploads/')) {
    return `${base}/api/method/addiwise.apis.order_types.utils.file_utils.proxy_s3?key=${encodeURIComponent(
      filePath
    )}`;
  }

  return '';
}
