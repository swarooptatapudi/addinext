'use client';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { useLazyGetPatientsQuery } from '@/rtk-query/apis/patient';
import React, { useEffect, useRef, useState } from 'react';
import { RootState } from '@/rtk-query/store';
import { useSelector } from 'react-redux';
import { AddPatientDialog } from './AddPatientDialog';

export default function PatientPicker({ value, onChange, setFieldValue, setIsPatientSelected, ...props }: any) {
  const [getPatients, { data }] = useLazyGetPatientsQuery();
  const [search, setSearch] = useState('');
  const { user } = useSelector((state: RootState) => state.userReducer);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search) {
        const filters = {
          patient_name: ['like', `%${search}%`],
          owner: ['like', `%${user.user_id}%`]
        };
        getPatients(JSON.stringify(filters));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirm = () => {
    setModelOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        label="Patient Name"
        value={value}
        onChange={(e) => {
          setSearch(e.target.value);
          if (onChange) onChange(e);
          if (!e.target.value) setIsPatientSelected(false);
        }}
        onFocus={() => setOpen(true)}
        {...props}
      />
      <div className={`absolute top-[105%] w-full z-10 bg-white shadow rounded border ${open ? 'block' : 'hidden'}`}>
        {data?.length ? (
          data.map((patient: any) => (
            <div
              key={patient.name}
              className="p-2 cursor-pointer hover:bg-primary/10 text-xs border-b last:border-b-0"
              onClick={() => {
                setOpen(false);
                setFieldValue('patient_name', patient?.patient_name || '');
                setFieldValue('weight', patient?.weight);
                setFieldValue('date_of_birth', patient?.date_of_birth || '');
                setFieldValue('height', patient?.height || '');
                setFieldValue('email', patient?.email || '');
                setFieldValue('mobile_no', patient?.mobile_no || '');
                setFieldValue('gender', patient?.gender || '');
                setFieldValue('clinic_name', patient?.clinic_name || '');
                setIsPatientSelected(true);
              }}
            >
              {patient.patient_name}({patient.date_of_birth})
            </div>
          ))
        ) : (
          <button 
            onClick={() => {
              setOpen(false);
              setModelOpen(true);
            }} 
            className="w-full p-2 text-center bg-[#735daf] text-sm text-white"
          >
            + Add New Patient
          </button>
        )}
      </div>

      <AddPatientDialog 
        open={modelOpen} 
        onOpenChange={setModelOpen} 
        onConfirm={handleConfirm} 
      />
    </div>
  );
}


//=====will be use in feture and check ================================================================================
// 'use client';

// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { SelectBox } from '@/components/ui/selectbox';
// import { useLazyGetPatientsQuery } from '@/rtk-query/apis/patient';
// import React, { useEffect, useRef, useState } from 'react';
// import { RootState } from '@/rtk-query/store';
// import { useSelector } from 'react-redux';

// export default function PatientPicker({ value, onChange, setFieldValue, setIsPatientSelected, ...props }: any) {
//   const [getPatients, { data }] = useLazyGetPatientsQuery();
//   const [search, setSearch] = useState('');
//   const { user } = useSelector((state: RootState) => state.userReducer);
//   const [open, setOpen] = useState(false);
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const [modelOpen, setModelOpen] = useState(false);

//   // fetch patients on typing
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (search) {
//         const filters = {
//           patient_name: ['like', `%${search}%`],
//           owner: ['like', `%${user.user_id}%`]
//         };
//         getPatients(JSON.stringify(filters));
//       }
//     }, 500);
//     return () => clearTimeout(timeout);
//   }, [search]);

//   // close dropdown on outside click
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={wrapperRef}>
//       <Input
//         label="Patient Name"
//         value={value}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           if (onChange) onChange(e);
//           if (!e.target.value) setIsPatientSelected(false);
//         }}
//         onFocus={() => setOpen(true)}
//         {...props}
//       />
//       <div className={`absolute top-[105%] w-full z-10 bg-white shadow rounded border ${open ? 'block' : 'hidden'}`}>
//         {data?.length ? (
//           data.map((patient: any) => (
//             <div
//               key={patient.name}
//               className="p-2 cursor-pointer hover:bg-primary/10 text-xs border-b last:border-b-0"
//               onClick={() => {
//                 setOpen(false);
//                 setFieldValue('patient_name', patient?.patient_name || '');
//                 setFieldValue('weight', patient?.weight);
//                 setFieldValue('date_of_birth', patient?.date_of_birth || '');
//                 setFieldValue('height', patient?.height || '');
//                 setFieldValue('email', patient?.email || '');
//                 setFieldValue('mobile_no', patient?.mobile_no || '');
//                 setFieldValue('gender', patient?.gender || '');
//                 setIsPatientSelected(true);
//               }}
//             >
//               {patient.patient_name}({patient.date_of_birth})
//             </div>
//           ))
//         ) : (
//           <button 
//           onClick={() => {
//             setOpen(false);
//             setModelOpen(true);
//           }} 
//           className="w-full p-2 text-center bg-[#735daf] text-sm text-white"
//         >
//           + Add New Patient
//         </button>
//         )}
//       </div>

//       {/* Modal Dialog */}
//       <Dialog open={modelOpen} onOpenChange={setModelOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Add New Patient</DialogTitle>
//           </DialogHeader>

//           <div className="text-xs space-y-2">
//             <div className="grid grid-cols-2 gap-2 col-span-2 mt-4">
//               <Input
//                 label="Date of Birth"
//                 type="date"
//                 className='mb-4'
//               />
//               <Input
//                 placeholder="65"
//                 label="Height (cm)"
//               />
//               <Input
//                 className='mb-4'
//                 placeholder="50"
//                 label="Weight (kgs)"
//               />
//               <Input
//                 placeholder="10 digit phone number"
//                 label="Mobile Number"
//               />
//               <Input
//                 placeholder="Email"
//                 label="Email"
//               />
//               <SelectBox
//                 options={[
//                   { value: 'Male', label: 'Male' },
//                   { value: 'Female', label: 'Female' }
//                 ]}
//                 label="Gender"
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setModelOpen(false)}>
//               Cancel
//             </Button>
//             <Button>Confirm</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
