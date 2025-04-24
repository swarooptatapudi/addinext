import { SelectBox } from "@/components/ui/selectbox";
import { GenericFileViewer } from "@/components/app/common/GenericFileViewer";
import { useState, useEffect } from 'react';

type FormOptions = {
    [key: string]: Array<{ value: string; label: string }>;
};

type Step3Props = {
    values: {
        locking_system: string;
        [key: string]: any;
    };
    handleChange: (field: string) => (value: string) => void;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    setFieldValue: (field: string, value: any) => void;
    FORM_OPTIONS: FormOptions;
    formSubmitted: boolean;
};

// Local file mappings
const LOCAL_FILE_MAPPINGS: Record<string, string> = {
    'Bull Dog': '/assets/order-forms/bk-order/PDF/BK Form.pdf',
    'Manual Suction':'/assets/order-forms/bk-order/BK1.png'
    // Add other mappings as needed
};

export const Step3 = ({ 
    values, 
    handleChange, 
    errors, 
    touched, 
    setFieldValue,
    FORM_OPTIONS,
    formSubmitted 
}: any) => {
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
    const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
    const [localFiles, setLocalFiles] = useState<Record<string, string>>({});
    
    const shouldShowError = (fieldName: string, isRequired = false) => {
        if (!isRequired && !values[fieldName]) {
            return false;
        }    
        if (isRequired && (formSubmitted || touched[fieldName])) {
            return !!errors[fieldName];
        }    
        return !!(touched[fieldName] && errors[fieldName]);
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            Object.values(objectUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [objectUrls]);

    // Handle locking system change
    const handleLockingSystemChange = (value: string) => {
        handleChange('locking_system')(value);
        
        // Check if this value has a local file mapping
        if (LOCAL_FILE_MAPPINGS[value]) {
            setLocalFiles(prev => ({
                ...prev,
                locking_system: LOCAL_FILE_MAPPINGS[value]
            }));
        } else {
            // Remove local file if the selection doesn't have one
            setLocalFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles.locking_system;
                return newFiles;
            });
        }
    };

    const showFileUpload = ['Other', 'Provision for Dummy'].includes(values.locking_system);

    const handleFileSelect = (fieldName: string) => (file: File | null) => {
        if (file) {
            const newObjectUrl = URL.createObjectURL(file);
            
            setUploadedFiles(prev => ({
                ...prev,
                [fieldName]: file
            }));
            
            setObjectUrls(prev => ({
                ...prev,
                [fieldName]: newObjectUrl
            }));
            
            setFieldValue(fieldName, file.name);
        }
    };

    const removeFile = (fieldName: string) => {
        if (objectUrls[fieldName]) {
            URL.revokeObjectURL(objectUrls[fieldName]);
        }
        
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[fieldName];
            return newFiles;
        });
        
        setObjectUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[fieldName];
            return newUrls;
        });
        
        setFieldValue(fieldName, '');
    };

    const openFileInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Locking Mechanism</h3>
            
            <div className="grid grid-cols-3 gap-4">
                <SelectBox
                    options={FORM_OPTIONS['locking_system'] ?? []}
                    label="Locking/Suspension System"
                    value={values.locking_system}
                    onValueChange={handleLockingSystemChange}
                    // error={shouldShowError('locking_system', true)}
                    // errorMessage={errors.locking_system}
                />
                
                {showFileUpload && (
                    <div className="col-span-2">
                        <div className="w-full">
                            <span className="block text-sm font-medium text-gray-700 mb-1">
                                Add File with dimensions (PDF, JPEG, PNG, PDG)
                            </span>
                            <GenericFileViewer
                                allowedTypes={['.pdf', '.jpeg', '.jpg', '.png', '.pdg']}
                                maxSizeMB={5}
                                label="Select File"
                                buttonText="Upload File"
                                onFileSelect={handleFileSelect('locking_system_file')}
                                // error={shouldShowError('locking_system_file')}
                                // errorMessage={errors.locking_system_file}
                            />                            
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Available Documents
                </h4>
                
                {/* Display local files */}
                {localFiles.locking_system && (
                    <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Predefined Files:</p>
                        <button
                            type="button"
                            onClick={() => openFileInNewTab(localFiles.locking_system)}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            {values.locking_system} Documentation
                        </button>
                    </div>
                )}
                
                {/* Display uploaded files */}
                {Object.keys(uploadedFiles).length > 0 ? (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Uploaded Files:</p>
                        <ul className="space-y-1">
                            {Object.entries(uploadedFiles).map(([fieldName, file]) => (
                                <li key={fieldName} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openFileInNewTab(objectUrls[fieldName])}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        {file.name}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(fieldName)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        × Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    !localFiles.locking_system && (
                        <p className="text-sm text-gray-500">
                            No files available yet. Select an option or upload files.
                        </p>
                    )
                )}
            </div>
            
            <div className="mt-1 text-sm text-gray-700">
                <p>Note: 4 hole adapter shall be provided</p>
            </div>
        </div>
    );
};

//----------------------------------------------------------------------------------
// import { SelectBox } from "@/components/ui/selectbox";
// import StlFilePicker from '@/components/app/common/StlPreviewer';
// import { GenericFileViewer } from "@/components/app/common/GenericFileViewer";

// export const Step3 = ({ 
//     values, 
//     handleChange, 
//     errors, 
//     touched, 
//     setFieldValue,
//     FORM_OPTIONS,
//     formSubmitted 
// }: any) => {
//     const shouldShowError = (fieldName: string, isRequired = false) => {
//         if (!isRequired && !values[fieldName]) {
//             return false;
//         }    
//         if (isRequired && (formSubmitted || touched[fieldName])) {
//             return !!errors[fieldName];
//         }    
//         return !!(touched[fieldName] && errors[fieldName]);
//     };
//     const showFootAmputation = ['Other', 'Provision for Dummy'].includes(values.locking_system);
//     return (
//         <div className="flex flex-col gap-4">
//             <h3 className="font-semibold text-lg">Locking Mechanism</h3>
            
//             <div className="grid grid-cols-3 gap-4">
//                 <SelectBox
//                     options={FORM_OPTIONS['locking_system'] ?? []}
//                     label="Locking/Suspension System"
//                     value={values.locking_system}
//                     onValueChange={handleChange('locking_system')}
//                 />
                
//                 {/* Conditionally render the foot amputation selector */}
//                 {showFootAmputation && (
//                     <div className="w-fit justify-center ml-5 mb-10">
//                          <span className="mb-1 text-[12px] mb-5">Add File with dimensions</span>
//                         {/* <p>Add File with dimensions</p> */}
//                         <GenericFileViewer
//                                     allowedTypes={['.pdf', '.png', '.jpg', '.jpeg']}
//                                     maxSizeMB={5}
//                                     label="Select Image"
//                                     buttonText="File Upload"
//                                     onFileSelect={(file) => console.log('Model A selected:', file?.name)}
//                                   />
                                
//                               </div>
//                 )}
//             </div>
//             <div className="mt-0 text-sm text-gray-400 text-primary ">
//             Provide Clickable Links to open a pdf file attached with each
//             </div>
//             <div className="mt-0 text-sm text-gray-700">
//                 Note: 4 hole adapter shall be provided
//             </div>
//         </div>
//     );
// };
