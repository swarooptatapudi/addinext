import { useMemo, useState } from 'react';

export function usePagination<T>(
  data: T[] = [],
  pageSize = 10
) {
  const [page, setPage] = useState(1);

  const { pagedData, totalPages, totalItems } = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      pagedData: data.slice(start, end),
      totalPages,
      totalItems,
    };
  }, [data, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    pagedData,
    totalPages,
    totalItems,
  };
}
