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
      socket_type: string;
      design_variation: string;
      model_name: string;
      activity_level: string;
    };
    selectedItem: string;
    isItemFetching: boolean;
    isOrderCreating: boolean;
    onConfirm: () => void;
  }
  
  export const ConfirmOrderDialog = ({
    open,
    onOpenChange,
    formValues,
    selectedItem,
    isItemFetching,
    isOrderCreating,
    onConfirm,
  }: ConfirmOrderDialogProps) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
          </DialogHeader>
  
          <div className="text-xs">
            <div className="flex justify-between items-center border-t p-2">
              <span>Socket Type</span>
              <span>{formValues.socket_type}</span>
            </div>
            <div className="flex justify-between items-center border-t p-2">
              <span>Design Variation</span>
              <span>{formValues.design_variation}</span>
            </div>
            <div className="flex justify-between items-center border-t p-2">
              <span>Modal</span>
              <span>{formValues.model_name}</span>
            </div>
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
  
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant={'outline'}>
              Amend
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isItemFetching || isOrderCreating || !selectedItem}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };