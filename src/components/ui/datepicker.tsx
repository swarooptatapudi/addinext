'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({
  label,
  required,
  onChange,
  value
}: {
  label?: string;
  required?: boolean;
  value: any;
  onChange: any;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (val: any) => {
    onChange(val);
    setOpen(false); // Close popover on select
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col">
          <p className="mb-1 text-xs ">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {value ? format(value, 'dd-MM-yyyy') : <span>Pick a date</span>}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
