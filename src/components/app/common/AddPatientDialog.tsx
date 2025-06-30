'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SelectBox } from '@/components/ui/selectbox';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
import { useCreatePatientMutation } from '@/rtk-query/apis/patient';
import { RootState } from '@/rtk-query/store';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface AddPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm?: (values: PatientFormValues) => void;
}

interface PatientFormValues {
    first_name: string;
    last_name: string;
    dob: string;
    height: string;
    weight: string;
    mobile_no: string;
    email: string;
    gender: string;
    clinic_name: string;
}

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
];

const validationSchema = Yup.object().shape({
    first_name: Yup.string()
        .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
        .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
        .required(FORMIK_ERRORS.REQUIRED),
    last_name: Yup.string()
        .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
        .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
        .required(FORMIK_ERRORS.REQUIRED),
    dob: Yup.date()
        .required(FORMIK_ERRORS.REQUIRED)
        .max(new Date(), 'Date of birth cannot be in the future'),
    height: Yup.string()
        .required(FORMIK_ERRORS.REQUIRED)
        .matches(/^\d+(\.\d{1,2})?$/, {
            message: 'Must be a number (e.g. 92.57 or 95)',
            excludeEmptyString: true
        })
        .test(
            'min-height',
            'Minimum height is 91cm',
            (value) => !value || parseFloat(value) >= 91
        )
        .test(
            'max-height',
            'Maximum height is 213.00cm',
            (value) => !value || parseFloat(value) <= 213.00
        ),
    weight: Yup.string()
        .required('Weight is required')
        .matches(/^\d+(\.\d{1,2})?$/, {
            message: 'Must be a number (e.g. 65.5 or 70)',
            excludeEmptyString: false
        })
        .test(
            'min-weight',
            'Minimum weight is 10kg',
            (value) => parseFloat(value) >= 10
        )
        .test(
            'max-weight',
            'Maximum weight is 180kg',
            (value) => parseFloat(value) <= 180
        ),
    mobile_no: Yup.string()
        .matches(FORMIK_ERRORS.MOBILE_NUMBER.VALUE, FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE),
    email: Yup.string()
        .email(FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
        .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE),
    gender: Yup.string().required(FORMIK_ERRORS.REQUIRED),
    clinic_name: Yup.string()
        .max(100, 'Clinic name must be less than 100 characters')
});

export function AddPatientDialog({ open, onOpenChange, onConfirm }: AddPatientDialogProps) {
    const [createPatient, { isLoading }] = useCreatePatientMutation();
    const { user } = useSelector((state: RootState) => state.userReducer);
    

    const formik = useFormik<PatientFormValues>({
        initialValues: {
            first_name: '',
            last_name: '',
            dob: '',
            height: '',
            weight: '',
            mobile_no: '',
            email: '',
            gender: '',
            clinic_name: `${user.full_name}`
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const result = await createPatient(values).unwrap();
                onConfirm?.(values); // Pass the form values back to parent
                resetForm();
                onOpenChange(false);
                toast.success('Patient created successfully');
            } catch (err) {
                console.error('Error creating patient:', err);
            }
        }
    });

    useEffect(() => {
        if (!open) {
            formik.resetForm();
             
        }
    }, [open]);

    const handleCancel = () => {
        formik.resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className='text-primary'>Add New Patient</DialogTitle>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="first_name"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            required
                            inVaild={formik.touched.first_name && !!formik.errors.first_name}
                            error={formik.touched.first_name ? formik.errors.first_name : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            required
                            inVaild={formik.touched.last_name && !!formik.errors.last_name}
                            error={formik.touched.last_name ? formik.errors.last_name : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            name="dob"
                            value={formik.values.dob}
                            onChange={formik.handleChange}
                            required
                            inVaild={formik.touched.dob && !!formik.errors.dob}
                            error={formik.touched.dob ? formik.errors.dob : undefined}
                            onBlur={formik.handleBlur}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <Input
                            label="Height (cm)"
                            name="height"
                            placeholder="165"
                            value={formik.values.height}
                            onChange={formik.handleChange}
                            required
                            inVaild={formik.touched.height && !!formik.errors.height}
                            error={formik.touched.height ? formik.errors.height : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <Input
                            label="Weight (kg)"
                            name="weight"
                            placeholder="65"
                            value={formik.values.weight}
                            onChange={formik.handleChange}
                            required
                            inVaild={formik.touched.weight && !!formik.errors.weight}
                            error={formik.touched.weight ? formik.errors.weight : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <SelectBox
                            options={GENDER_OPTIONS}
                            label="Gender"
                            name="gender"
                            value={formik.values.gender}
                            onValueChange={(value) => formik.setFieldValue('gender', value)}
                            required
                            inVaild={formik.touched.gender && !!formik.errors.gender}
                            error={formik.touched.gender ? formik.errors.gender : undefined}
                        />
                        <Input
                            label="Mobile Number"
                            name="mobile_no"
                            placeholder="10 digit phone number"
                            value={formik.values.mobile_no}
                            onChange={formik.handleChange}
                            inVaild={formik.touched.mobile_no && !!formik.errors.mobile_no}
                            error={formik.touched.mobile_no ? formik.errors.mobile_no : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <Input
                            label="Email"
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            inVaild={formik.touched.email && !!formik.errors.email}
                            error={formik.touched.email ? formik.errors.email : undefined}
                            onBlur={formik.handleBlur}
                        />
                        <Input
                            label="Clinic Name"
                            name="clinic_name"
                            placeholder="Clinic name"
                            value={formik.values.clinic_name}
                            onChange={formik.handleChange}
                            inVaild={formik.touched.clinic_name && !!formik.errors.clinic_name}
                            error={formik.touched.clinic_name ? formik.errors.clinic_name : undefined}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !formik.isValid || !formik.dirty}>
                            {isLoading ? 'Creating...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
//--------------------------------------------------------------------------
// 'use client';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { SelectBox } from '@/components/ui/selectbox';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FORMIK_ERRORS } from '@/uttils/constants/formik-errors.constants';
// import { useCreatePatientMutation } from '@/rtk-query/apis/patient';
// import { useEffect } from 'react';

// interface AddPatientDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onConfirm?: (values: PatientFormValues) => void;
// }

// interface PatientFormValues {
//     first_name: string;
//     last_name: string;
//     dob: string;
//     height: string;
//     weight: string;
//     mobile_no: string;
//     email: string;
//     gender: string;
//     clinic_name: string;
// }

// const GENDER_OPTIONS = [
//     { value: 'Male', label: 'Male' },
//     { value: 'Female', label: 'Female' },
//     { value: 'Other', label: 'Other' }
// ];

// const validationSchema = Yup.object().shape({
//     first_name: Yup.string()
//         .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
//         .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
//         .required(FORMIK_ERRORS.REQUIRED),
//     last_name: Yup.string()
//         .min(FORMIK_ERRORS.MIN_2.VALUE, FORMIK_ERRORS.MIN_2.MESSAGE)
//         .max(FORMIK_ERRORS.MAX_50.VALUE, FORMIK_ERRORS.MAX_50.MESSAGE)
//         .required(FORMIK_ERRORS.REQUIRED),
//     dob: Yup.date()
//         .required(FORMIK_ERRORS.REQUIRED)
//         .max(new Date(), 'Date of birth cannot be in the future'),
//     height: Yup.string()
//         .required(FORMIK_ERRORS.REQUIRED)
//         .matches(/^\d+(\.\d{1,2})?$/, {
//             message: 'Must be a number (e.g. 92.57 or 95)',
//             excludeEmptyString: true
//         })
//         .test(
//             'min-height',
//             'Minimum height is 91cm',
//             (value) => !value || parseFloat(value) >= 91
//         )
//         .test(
//             'max-height',
//             'Maximum height is 213.00cm',
//             (value) => !value || parseFloat(value) <= 213.00
//         ),
//     weight: Yup.string()
//         .required('Weight is required')
//         .matches(/^\d+(\.\d{1,2})?$/, {
//             message: 'Must be a number (e.g. 65.5 or 70)',
//             excludeEmptyString: false
//         })
//         .test(
//             'min-weight',
//             'Minimum weight is 10kg',
//             (value) => parseFloat(value) >= 10
//         )
//         .test(
//             'max-weight',
//             'Maximum weight is 180kg',
//             (value) => parseFloat(value) <= 180
//         ),
//     mobile_no: Yup.string()
//         .matches(FORMIK_ERRORS.MOBILE_NUMBER.VALUE, FORMIK_ERRORS.MOBILE_NUMBER.MESSAGE),
//     email: Yup.string()
//         .email(FORMIK_ERRORS.INVALID_EMAIL.MESSAGE)
//         .max(FORMIK_ERRORS.MAX_320.VALUE, FORMIK_ERRORS.MAX_320.MESSAGE),
//     gender: Yup.string().required(FORMIK_ERRORS.REQUIRED),
//     clinic_name: Yup.string()
//         .max(100, 'Clinic name must be less than 100 characters')
// });

// export function AddPatientDialog({ open, onOpenChange, onConfirm }: AddPatientDialogProps) {
//     const [createPatient, { isLoading, isSuccess, isError, error }] = useCreatePatientMutation();

//     const formik = useFormik<PatientFormValues>({
//         initialValues: {
//             first_name: '',
//             last_name: '',
//             dob: '',
//             height: '',
//             weight: '',
//             mobile_no: '',
//             email: '',
//             gender: '',
//             clinic_name: ''
//         },
//         validationSchema,
//         onSubmit: async (values, { resetForm }) => {
//             try {
//                 await createPatient(values).unwrap();
//                 onConfirm?.(values); // Optional callback
//                 resetForm();
//             } catch (err) {
//                 console.error('Error creating patient:', err);
//             }
//         }
//     });

//     useEffect(() => {
//         if (!open) {
//             formik.resetForm();
//         }
//     }, [open]);

//     const handleCancel = () => {
//         formik.resetForm();
//         onOpenChange(false);
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-[500px]">
//                 <DialogHeader>
//                     <DialogTitle>Add New Patient</DialogTitle>
//                 </DialogHeader>

//                 <form onSubmit={formik.handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <Input
//                             label="First Name"
//                             name="first_name"
//                             value={formik.values.first_name}
//                             onChange={formik.handleChange}
//                             required
//                             inVaild={formik.touched.first_name && !!formik.errors.first_name}
//                             error={formik.touched.first_name ? formik.errors.first_name : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <Input
//                             label="Last Name"
//                             name="last_name"
//                             value={formik.values.last_name}
//                             onChange={formik.handleChange}
//                             required
//                             inVaild={formik.touched.last_name && !!formik.errors.last_name}
//                             error={formik.touched.last_name ? formik.errors.last_name : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <Input
//                             label="Date of Birth"
//                             type="date"
//                             name="dob"
//                             value={formik.values.dob}
//                             onChange={formik.handleChange}
//                             required
//                             inVaild={formik.touched.dob && !!formik.errors.dob}
//                             error={formik.touched.dob ? formik.errors.dob : undefined}
//                             onBlur={formik.handleBlur}
//                             max={new Date().toISOString().split('T')[0]}
//                         />
//                         <Input
//                             label="Height (cm)"
//                             name="height"
//                             placeholder="165"
//                             value={formik.values.height}
//                             onChange={formik.handleChange}
//                             required
//                             inVaild={formik.touched.height && !!formik.errors.height}
//                             error={formik.touched.height ? formik.errors.height : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <Input
//                             label="Weight (kg)"
//                             name="weight"
//                             placeholder="65"
//                             value={formik.values.weight}
//                             onChange={formik.handleChange}
//                             required
//                             inVaild={formik.touched.weight && !!formik.errors.weight}
//                             error={formik.touched.weight ? formik.errors.weight : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <SelectBox
//                             options={GENDER_OPTIONS}
//                             label="Gender"
//                             name="gender"
//                             value={formik.values.gender}
//                             onValueChange={(value) => formik.setFieldValue('gender', value)}
//                             required
//                             inVaild={formik.touched.gender && !!formik.errors.gender}
//                             error={formik.touched.gender ? formik.errors.gender : undefined}
//                         />
//                         <Input
//                             label="Mobile Number"
//                             name="mobile_no"
//                             placeholder="10 digit phone number"
//                             value={formik.values.mobile_no}
//                             onChange={formik.handleChange}
//                             inVaild={formik.touched.mobile_no && !!formik.errors.mobile_no}
//                             error={formik.touched.mobile_no ? formik.errors.mobile_no : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <Input
//                             label="Email"
//                             name="email"
//                             placeholder="Email"
//                             value={formik.values.email}
//                             onChange={formik.handleChange}
//                             inVaild={formik.touched.email && !!formik.errors.email}
//                             error={formik.touched.email ? formik.errors.email : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                         <Input
//                             label="Clinic Name"
//                             name="clinic_name"
//                             placeholder="Clinic name"
//                             value={formik.values.clinic_name}
//                             onChange={formik.handleChange}
//                             inVaild={formik.touched.clinic_name && !!formik.errors.clinic_name}
//                             error={formik.touched.clinic_name ? formik.errors.clinic_name : undefined}
//                             onBlur={formik.handleBlur}
//                         />
//                     </div>

//                     <DialogFooter>
//                         <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
//                             Cancel
//                         </Button>
//                         <Button type="submit" disabled={isLoading || !formik.isValid || !formik.dirty}>
//                             {isLoading ? 'Creating...' : 'Confirm'}
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     );
// }
