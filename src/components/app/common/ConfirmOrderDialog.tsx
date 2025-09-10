
'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formValues: {
        socket_type?: string;
        design_variation?: string;
        model_name?: string;
        activity_level?: string;
        insole_model?: string; // Added optional insole_model
        // insoleType?: string;
         insoletype?: string; 
          selectedinsoletype?: string;
          insoleOptions?: { value: string; label: string }[]; // Added insoleOptions prop
        usage?: string;  // Added optional usage
        
    };
    selectedItem: string;
    isItemFetching: boolean;
    isOrderCreating: boolean;
    item_type?: string;
    onConfirm: () => void;
    showContinueButton?: boolean; // Add this optional prop
     insoleOptions?: { value: string; label: string }[];
}


const insoleOptions = [
  { value: 'City Comfort', label: 'Daily comfort for urban walking' },
  { value: 'Endurance', label: 'Support for long hours on foot' },
  { value: 'Sensitive', label: 'Extra soft cushioning support' },
  { value: 'Sports', label: 'Sports stability and shock absorption' },
  { value: 'Diabetics', label: 'Diabetic foot pressure protection' },
];

export const ConfirmOrderDialog = ({
    open,
    onOpenChange,
    formValues,
    selectedItem,
    isItemFetching,
    isOrderCreating,
     item_type,   
    onConfirm,
    showContinueButton = false, // Default to false
    
}: ConfirmOrderDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-primary'>Confirm Order</DialogTitle>
                </DialogHeader>

                <div className="text-xs">
                    <div className="flex justify-between items-center border-t p-2">
                        <span>{formValues.socket_type ? 'Socket Type' : 'Insole Type'}</span>
                        <span>{formValues.socket_type || formValues.insoletype}</span>
                    </div>
                    <div className="flex justify-between items-center border-t p-2">
                        <span>{formValues.design_variation ? 'Design Variation Type' : 'Usage'}</span>
                        <span>{formValues.design_variation} {insoleOptions.find(opt => opt.value === formValues.insoletype)?.label || ''}</span>
                    </div>
                    <div className="flex justify-between items-center border-t p-2">
                        <span>Modal</span>
                        <span>{formValues.model_name || formValues.insole_model}</span>
                    </div>
                     {/* <div className="flex justify-between items-center border-t p-2">
                        <span>Usage</span>
                        <span>
                            {insoleOptions.find(opt => opt.value === formValues.insoletype)?.label || '—'}
                        </span>
                    </div> */}
                    <div className="flex justify-between items-center border-y p-2">
                        <span>Activity Level</span>
                        <span>{formValues.activity_level}</span>
                    </div>
                    <div className="flex justify-between items-center border-b p-2 font-semibold">
                        <span>Item Code</span>
                        {isItemFetching ? (
                            <span className="loader"></span>
                        ) : (
                            <span>{selectedItem}</span>
                        )}
                    </div>
                </div>
        {/* {item_type === 'BK' && (
  <>
    <div className="flex justify-between items-center border-t p-2">
      <span>Socket Type</span>
      <span>{formValues.socket_type}</span>
    </div>
    <div className="flex justify-between items-center border-t p-2">
      <span>Design Variation</span>
      <span>{formValues.design_variation}</span>
    </div>
    <div className="flex justify-between items-center border-t p-2">
      <span>Model</span>
      <span>{formValues.model_name}</span>
    </div>
    <div className="flex justify-between items-center border-y p-2">
      <span>Activity Level</span>
      <span>{formValues.activity_level}</span>
    </div>
  </>
)}

{item_type === 'IN' && (
  <>
    <div className="flex justify-between items-center border-t p-2">
      <span>Usage</span>
      <span>{formValues.usage}</span>
    </div>
    <div className="flex justify-between items-center border-t p-2">
      <span>Insole Type</span>
      <span>{formValues.insoleType}</span>
    </div>
    <div className="flex justify-between items-center border-t p-2">
      <span>Insole Model</span>
      <span>{formValues.insole_model}</span>
    </div>
    <div className="flex justify-between items-center border-y p-2">
      <span>Activity Level</span>
      <span>{formValues.activity_level}</span>
    </div>
  </>
)} */}

{/* Common for all */}
{/* <div className="flex justify-between items-center border-b p-2 font-semibold">
  <span>Item Code</span>
  {isItemFetching ? (
    <span className="loader"></span>
  ) : (
    <span>{selectedItem}</span>
  )}
</div> */}



                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} variant={'outline'}>
                        Amend
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isItemFetching || isOrderCreating || !selectedItem}
                    >
                        {showContinueButton ? 'Continue' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// 'use client';
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
//   } from '@/components/ui/dialog';
//   import { Button } from '@/components/ui/button';
  
//   interface ConfirmOrderDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     formValues: {
//       socket_type: string;
//       design_variation: string;
//       model_name: string;
//       activity_level: string;
//     };
//     selectedItem: string;
//     isItemFetching: boolean;
//     isOrderCreating: boolean;
//     onConfirm: () => void;
//   }
  
//   export const ConfirmOrderDialog = ({
//     open,
//     onOpenChange,
//     formValues,
//     selectedItem,
//     isItemFetching,
//     isOrderCreating,
//     onConfirm,
//   }: ConfirmOrderDialogProps) => {
//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Order</DialogTitle>
//           </DialogHeader>
  
//           <div className="text-xs">
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Socket Type</span>
//               <span>{formValues.socket_type}</span>
//             </div>
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Design Variation</span>
//               <span>{formValues.design_variation}</span>
//             </div>
//             <div className="flex justify-between items-center border-t p-2">
//               <span>Modal</span>
//               <span>{formValues.model_name}</span>
//             </div>
//             <div className="flex justify-between items-center border-y p-2">
//               <span>Activity Level</span>
//               <span>{formValues.activity_level}</span>
//             </div>
//             <div className="flex justify-between items-center border-b p-2 font-semibold">
//               <span>Item Code</span>
//               {isItemFetching ? (
//                 <span className="loader"></span>
//               ) : (
//                 <span>{selectedItem}</span>
//               )}
//             </div>
//           </div>
  
//           <DialogFooter>
//             <Button onClick={() => onOpenChange(false)} variant={'outline'}>
//               Amend
//             </Button>
//             <Button
//               onClick={onConfirm}
//               disabled={isItemFetching || isOrderCreating || !selectedItem}
//             >
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     );
//   };