import { Button } from '@/components/ui/button';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
