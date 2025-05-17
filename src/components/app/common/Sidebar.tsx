'use client';
import { ROUTES } from '@/uttils/Routes';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className={`h-full ${open ? 'w-[250px]' : 'w-[100px] delay-75'}   bg-white drop-shadow-md rounded transition-all transition-width ease-in-out duration-300 `}
    >
      <div
        className="absolute bottom-4 -right-4 bg-primary  rounded-full p-2 z-20 cursor-pointer"
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
          {open && <h1 className="text-2xl font-bold  text-primary font-sans">ADDINxT</h1>}
        </div>

        <div className={'flex flex-col gap-4 items-center flex-1 w-full rounded-2xl mt-4'}>
          {ROUTES.map(
            (route: any) =>
              route.roles?.includes('admin') && (
                <Link
                  href={route.path}
                  key={route.path}
                  className={`flex items-center gap-4 p-4  cursor-pointer w-[80%] rounded-2xl ${'/' + pathname?.split('/')?.at(1) == route.path ? 'bg-primary/80 text-white drop-shadow-sm' : 'text-primary hover:bg-primary/10'} ${!open && 'justify-center'}`}
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
