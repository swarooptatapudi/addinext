'use client';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/rtk-query/store';
import { USER } from '@/uttils/Types';
import { useSelector } from 'react-redux';
import { Pencil } from 'lucide-react';
import { useUploadFileMutation, useUploadUserProfileMutation } from '@/rtk-query/apis/auth';

export default function Profile() {
  const { user }: { user: USER } = useSelector((state: RootState) => state.userReducer);
  const [uploadFile] = useUploadFileMutation();
  const [uploadUserProfile] = useUploadUserProfileMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatProfilePictureUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://deverp.addiwise.com${url}`;
    return url;
  };

  const currentProfilePicture = isClient ? formatProfilePictureUrl(user?.profile_picture) : '';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, JPG, or PNG only)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Home/Attachments');
      formData.append('is_private', '0');

      const uploadResponse = await uploadFile({ formData }).unwrap();
      const fileUrl = uploadResponse?.message?.file_url;

      if (!fileUrl) {
        throw new Error('File upload failed - no URL returned');
      }

      await uploadUserProfile({ file_url: fileUrl }).unwrap();
      setSuccess(true);
      // Instead of reloading, consider using a state update or router refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isClient) {
    // Return a skeleton loader or null during SSR
    return (
      <div className="mr-80">
        <Card className="max-w-3xl mx-auto shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-2x1 font-semibold ">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mr-80">
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-2x1 font-semibold text-primary">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <Avatar className="w-33 h-33 border-2 border-gray-200">
                {currentProfilePicture ? (
                  <AvatarImage
                    src={currentProfilePicture}
                    alt="Profile"
                    className="object-cover w-full h-full"
                    style={{
                      objectPosition: 'center',
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '';
                    }}
                  />
                ) : (
                  <AvatarFallback className="text-4xl bg-gray-100 flex items-center justify-center w-full h-full">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                <label className="cursor-pointer flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 text-gray-600 hover:text-primary transition-colors" />
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <p className="text-sm text-gray-500">@{user?.user_id}</p>
              </div>

              {user?.email && (
                <div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              {user?.active_plan && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Subscription:</p>
                    <Badge className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white border border-amber-600">
                      {user?.active_plan}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Plan expires on: <span className="font-medium">{user?.plan_expiration_date}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <div className="mt-4 space-y-2">
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                Updating profile picture...
              </div>
            )}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {success && (
              <div className="text-sm text-green-500">
                Profile picture updated successfully!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}