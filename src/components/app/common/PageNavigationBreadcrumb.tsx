'use client';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function PageNavigationBreadcrumb(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathname.split('/').map((path, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              <Link
                href={pathname
                  ?.split('/')
                  ?.slice(0, index + 1)
                  .join('/')}
                className="capitalize text-primary"
              >
                {path}
              </Link>
            </BreadcrumbItem>
            {index < pathname.split('/').length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight  />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
