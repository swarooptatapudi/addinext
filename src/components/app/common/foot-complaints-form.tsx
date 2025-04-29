'use client';
import React, { useState } from 'react';

interface CheckboxOption {
  id: string;
  label: string;
  group: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selectedOptions, onChange }) => {
  const handleCheckboxChange = (optionId: string) => {
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    onChange(newSelected);
  };

  // Group options by their group
  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = [];
    }
    acc[option.group].push(option);
    return acc;
  }, {} as Record<string, CheckboxOption[]>);

  return (
    <div className="max-w-3xl mx-auto p-6 w-[510px]">
      <div className="grid grid-cols-3 gap-y-3 ">
        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
          <React.Fragment key={group}>
            <div className="flex items-center">
              <span className="font-bold text-[14px] text-[#2d4562]">{group}</span>
            </div>
            
            {groupOptions.map((option, index) => (
              <div key={option.id} className="flex items-center">
                <div 
                  className={`w-5 h-5 border ${selectedOptions.includes(option.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-gray-100'}`}
                  onClick={() => handleCheckboxChange(option.id)}
                >
                  {selectedOptions.includes(option.id) && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-[13px] text-[#2d4562]">{option.label}</span>
              </div>
            ))}
            {groupOptions.length < 2 && Array.from({ length: 2 - groupOptions.length }).map((_, i) => (
              <div key={`empty-${group}-${i}`} className="flex items-center"></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Usage example
export default function FootComplaintsForm() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const footComplaintsOptions: CheckboxOption[] = [
    { id: 'plantar-fascitis', label: 'Plantar Fascitis', group: 'Heel Pain' },
    { id: 'heel-spur', label: 'Heel Spur', group: 'Heel Pain' },
    { id: 'flat-feet', label: 'Flat Feet', group: 'Arch Pain' },
    { id: 'pronation', label: 'Pronation', group: 'Arch Pain' },
    { id: 'metatarsalgia', label: 'Metatarsalgia', group: 'Metatarsal Pain' },
    { id: 'mortons-neuroma', label: 'Mortons Neuroma', group: 'Metatarsal Pain' },
    { id: 'heel-deformity', label: 'Heel Deformity', group: 'Ankle Pain' },
    { id: 'ankle-pain', label: 'Ankle Pain', group: 'Ankle Pain' },
    { id: 'osteoarthritis', label: 'OsteoArthritis', group: 'Knee Pain' },
    { id: 'corn', label: 'Corn', group: 'Skin Issues' },
    { id: 'calluses', label: 'Calluses', group: 'Skin Issues' },
    { id: 'achiles-tendonitis', label: 'Achiles Tendonitis', group: 'Ach Tend.' },
    { id: 'neuroma', label: 'Neuroma', group: 'Diabetic' },
    { id: 'shin-pain', label: 'Shin Pain', group: 'Shin Splint' },
    { id: 'high-arches', label: 'High Arches', group: 'Lateral Foot Pain' },
  ];

  return (
    <CheckboxGroup
      options={footComplaintsOptions}
      selectedOptions={selectedOptions}
      onChange={setSelectedOptions}
    />
  );
}