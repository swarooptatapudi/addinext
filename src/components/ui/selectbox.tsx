import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  //   SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type SelectBoxProps = React.ComponentProps<typeof Select> & {
  label?: string;
  placeholder?: string; // Extend with custom types
  className?: string;
  required?: boolean;
  options: Array<{
    value: string;
    label?: string;
  }>;
  inVaild?: boolean;
  error?: string;
};

export function SelectBox({
  placeholder,
  label,
  options,
  required,
  inVaild,
  error,
  ...props
}: SelectBoxProps) {
  return (
    <Select {...props}>
      <div>
        {label && (
          <p className="mb-1 text-xs ">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
        )}
        <SelectTrigger className={`w-full ${inVaild ? 'border-destructive' : ''}`}>
          <SelectValue placeholder={placeholder || 'Select'} />
        </SelectTrigger>
        {inVaild && (
          <p className="mt-1 text-[9px] text-destructive">{error || 'This field is required'}</p>
        )}
      </div>
      <SelectContent className="max-h-60">
        <SelectGroup>
          {/* <SelectLabel>Fruits</SelectLabel> */}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label || option.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
