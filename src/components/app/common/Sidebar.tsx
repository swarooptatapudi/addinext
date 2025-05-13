'use client';
import { ROUTES } from '@/uttils/Routes';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Building2, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useUser from '@/hooks/useUser';
import { AvatarImage } from '@radix-ui/react-avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { user } = useUser();

  const formatProfilePictureUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://deverp.addiwise.com${url}`;
    return url;
  };

  const currentProfilePicture = formatProfilePictureUrl(user?.profile_picture);

  return (
    <div
      className={`h-full ${
        open ? 'w-[250px]' : 'w-[100px] delay-75'
      } bg-white drop-shadow-md rounded transition-all transition-width ease-in-out duration-300`}
    >
      <div
        className="absolute bottom-4 -right-4 bg-primary rounded-full p-2 z-20 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <ChevronLeft
          size={20}
          color="white"
          className={`${open ? '' : 'rotate-180'} transition-[0.5]`}
        />
      </div>
      <div className="w-full h-full flex flex-col">
        <div className="h-16 flex items-center justify-center">
          {open && <h1 className="text-2xl font-bold text-primary font-sans">ADDINxT</h1>}
          {!open && (
            <div className="relative">
              <Avatar className="border border-gray-100 w-12 h-12 overflow-hidden">
  {currentProfilePicture ? (
    <AvatarImage
      src={currentProfilePicture}
      alt={user?.company_name ? `${user.company_name} logo` : 'Profile'}
      className={user?.company_name ? 'object-contain p-1 w-full h-full' : 'object-cover w-full h-full'}
                    style={{
                      objectPosition: 'center',
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
      onError={(e) => {
        e.currentTarget.src = '';
        e.currentTarget.className = 'hidden';
      }}
    />
  ) : null}
  <AvatarFallback
    className={`text-sm font-medium w-full h-full flex items-center justify-center ${
      user?.company_name ? 'bg-white text-gray-800' : 'bg-gray-100'
    }`}
  >
    {user?.company_name ? (
      <span className="truncate max-w-[32px]">
        {user.company_name
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase())
          .join('')}
      </span>
    ) : (
      <span>
        {user?.first_name?.charAt(0).toUpperCase()}
        {user?.last_name?.charAt(0).toUpperCase()}
      </span>
    )}
  </AvatarFallback>
</Avatar> 
              {user?.company_name && (
                <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border border-gray-200">
                  <Building2 className="w-3 h-3 text-gray-500" />
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 items-center flex-1 w-full rounded-2xl mt-4">
          {ROUTES.map(
            (route: any) =>
              route.roles?.includes('admin') && (
                <Link
                  href={route.path}
                  key={route.path}
                  className={`flex items-center gap-4 p-4 cursor-pointer w-[80%] rounded-2xl ${
                    '/' + pathname?.split('/')?.at(1) === route.path
                      ? 'bg-primary/80 text-white drop-shadow-sm'
                      : 'text-primary hover:bg-primary/10'
                  } ${!open && 'justify-center'}`}
                >
                  {route.icon && <route.icon size={20} />}
                  {open && <p className="text-sm">{route.name}</p>}
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
}