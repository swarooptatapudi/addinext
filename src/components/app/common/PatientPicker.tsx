'use client';

import { Input } from '@/components/ui/input';
import { useLazyGetPatientsQuery } from '@/rtk-query/apis/patient';
import React, { useEffect, useRef, useState } from 'react';
import { RootState } from '@/rtk-query/store';
import { useSelector } from 'react-redux';
export default function PatientPicker({ value, onChange, setFieldValue,setIsPatientSelected, ...props }: any) {
  const [getPatients, { data }] = useLazyGetPatientsQuery();
  const { user } = useSelector((state: RootState) => state.userReducer);
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // fetch on typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search) {
         // const filters = [['patient_name', 'like', `%${search}%`]];
          const filters = {
          patient_name: ['like', `%${search}%`],
          owner: ['like',  `%${user.user_id}%`]
        };
        getPatients(JSON.stringify(filters));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative `} ref={wrapperRef}>
      <Input
        label="Patient Name"
        value={value}
        onChange={(e) => {
          setSearch(e.target.value);
          if (onChange) {
            onChange(e);
          }
          if (!e.target.value) {
            setIsPatientSelected(false); // Reset when input is cleared
          }
        }}
        onFocus={() => setOpen(true)}
        {...props}
      />
      <div
        className={`absolute top-[105%] w-full z-10 bg-white shadow rounded border ${
          open && data?.length ? 'block' : 'hidden'
        }`}
      >
        {data?.map((patient: any) => (
          <div
            key={patient.name}
            className="p-2 cursor-pointer hover:bg-primary/10 text-xs  border-b last:border-b-0"
            onClick={() => {
              setOpen(false);
              // onPatientSelect(patient);
              setFieldValue('patient_name', patient?.patient_name || '');
              setFieldValue('weight', patient?.weight);
              setFieldValue('date_of_birth', patient?.date_of_birth || '');
              setFieldValue('height', patient?.height || '');
              setFieldValue('email', patient?.email || '');
              setFieldValue('mobile_no', patient?.mobile_no || '');
              setFieldValue('gender', patient?.gender || '');
              setIsPatientSelected(true);
            }}
          >
            {patient.patient_name}({patient.date_of_birth})
          </div>
        ))}
      </div>
    </div>
  );
}
