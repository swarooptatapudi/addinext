import React, { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OrderSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderSummaryModal = ({  }) => {
  const [open, setOpen] = useState(true);
  
  // Sample data structure based on your provided data
  const orderData = {
    "item_type": "BK",
    "customer": "Rohit Sharma",
    "order_details": {
      "patient_name": "raji gup",
      "gender": "Male",
      "date_of_birth": "1960-01-01",
      "height": 165,
      "weight": 87,
      "mobile_no": "",
      "email": "",
      "authorized_representative": "",
      "assessment_date": "",
      "amputation_date": "",
      "reason_for_amputation": "",
      "stump_condition": "",
      "stump_length": "10",
      "file_dimensions": "",
      "amputated_leg": "",
      "stump_size": "",
      "previous_prosthetic_experience": "",
      "stump_type": "",
      "locking_system": "",
      "scan_condition": "",
      "scan_markings": "",
      "foot_type": "",
      "shoe_size": "",
      "flexion_angle": "",
      "add_abd_angle": "",
      "liner_type": "",
      "liner_thickness": "",
      "direct_body": "Direct_Body ",
      "activity_level": "K2",
      "adapter_type": "",
      "socket_type": "Check Socket",
      "design_variation": "Standard (SX)",
      "model_name": "AddiEaseEco",
      "additional_customization_requirements": "",
      "foot_Amputation": "Left_Foot",
      "leftFootFile": {},
      "rightFootFile": null,
      "upload_link": "",
      "global_volume_reduction": "",
      "gst_5": "447.30",
      "gst_18": "0.00",
      "item_discount": "3,834.00",
      "additional_discount": "0.00",
      "socket_design_details": [
        {
          "area": "A",
          "area_name": "Patella",
          "default_mm": "+1",
          "cpo_input_mm": ""
        },
        {
          "area": "B",
          "area_name": "Patella Tendon",
          "default_mm": "-8",
          "cpo_input_mm": ""
        },
        {
          "area": "C",
          "area_name": "Crest of Tibia",
          "default_mm": "+3",
          "cpo_input_mm": ""
        },
        {
          "area": "D",
          "area_name": "Lateral Shaft Tibia",
          "default_mm": "-3",
          "cpo_input_mm": ""
        },
        {
          "area": "E",
          "area_name": "Medial Shaft Tibia",
          "default_mm": "-3",
          "cpo_input_mm": ""
        },
        {
          "area": "F",
          "area_name": "Distal End Tibia",
          "default_mm": "+6",
          "cpo_input_mm": ""
        },
        {
          "area": "G",
          "area_name": "Medial Supracondylar",
          "default_mm": "-4",
          "cpo_input_mm": ""
        },
        {
          "area": "H",
          "area_name": "Hamstring Tendons",
          "default_mm": "+2",
          "cpo_input_mm": ""
        },
        {
          "area": "I",
          "area_name": "Hamstring Tendons",
          "default_mm": "+2",
          "cpo_input_mm": ""
        },
        {
          "area": "J",
          "area_name": "Posterior Conmpartment",
          "default_mm": "-4",
          "cpo_input_mm": ""
        },
        {
          "area": "K",
          "area_name": "Lateral Supracondylar",
          "default_mm": "-4",
          "cpo_input_mm": ""
        },
        {
          "area": "L",
          "area_name": "Head of Fibula",
          "default_mm": "+3",
          "cpo_input_mm": ""
        },
        {
          "area": "M",
          "area_name": "Distal End Fibula",
          "default_mm": "+4",
          "cpo_input_mm": ""
        },
        {
          "area": "N",
          "area_name": "Tibial Tuberosity",
          "default_mm": "+1",
          "cpo_input_mm": ""
        }
      ],
      "value_c_details": [
        {
          "gap": "00 cm",
          "value": ""
        },
        {
          "gap": "05 cm",
          "value": ""
        },
        {
          "gap": "10 cm",
          "value": ""
        },
        {
          "gap": "15 cm",
          "value": ""
        },
        {
          "gap": "20 cm",
          "value": ""
        },
        {
          "gap": "25 cm",
          "value": ""
        },
        {
          "gap": "30 cm",
          "value": ""
        },
        {
          "gap": "35 cm",
          "value": ""
        }
      ],
      "clinic_name": "Rohit Gupta",
      "finish_type": "Dye",
      "Design_by": "Addiwise",
      "Print_by": "Addiwise",
      "Latices": "No"
    },
    "item_code": "BK-CS-SX-T1-AEE-M",
    "addicoins": 0
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not specified";
    }
    return value;
  };

  interface SectionHeaderProps {
    title: string;
    stepNumber: number;
  }

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title, stepNumber }) => (
    <div className="bg-gray-50 p-4 rounded-t-lg border-b-2">
      <h3 className="font-semibold text-lg text-gray-800">
        Step {stepNumber}: {title}
      </h3>
    </div>
  );

  interface DataRowProps {
    label: string;
    value: any;
    isLast?: boolean;
  }

  const DataRow: React.FC<DataRowProps> = ({ label, value, isLast = false }) => (
    <div className={`flex justify-between items-center p-3 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 font-medium">{formatValue(value)}</span>
    </div>
  );

  interface SectionProps {
    title: string;
    stepNumber: number;
    children: ReactNode;
  }

  const Section: React.FC<SectionProps> = ({ title, stepNumber, children }) => (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <SectionHeader title={title} stepNumber={stepNumber} />
      <div className="p-2">
        {children}
      </div>
    </div>
  );

  return (
   
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-[50vw] max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Header Info */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Customer:</span>
                  <p className="text-lg font-semibold text-gray-900">{orderData.customer}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Item Code:</span>
                  <p className="text-lg font-semibold text-gray-900">{orderData.item_code}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Basic Details & Measurements */}
            <Section title="Basic Details & Measurements" stepNumber={1}>
              <div className="grid grid-cols-1 gap-0">
                <DataRow label="Patient Name" value={orderData.order_details.patient_name} />
                <DataRow label="Gender" value={orderData.order_details.gender} />
                <DataRow label="Date of Birth" value={orderData.order_details.date_of_birth} />
                <DataRow label="Height" value={orderData.order_details.height ? `${orderData.order_details.height} cm` : ""} />
                <DataRow label="Weight" value={orderData.order_details.weight ? `${orderData.order_details.weight} kg` : ""} />
                <DataRow label="Mobile No" value={orderData.order_details.mobile_no} />
                <DataRow label="Email" value={orderData.order_details.email} />
                <DataRow label="Amputation Date" value={orderData.order_details.amputation_date} />
                <DataRow label="Amputated Leg" value={orderData.order_details.amputated_leg} />
                <DataRow label="Reason for Amputation" value={orderData.order_details.reason_for_amputation} />
                <DataRow label="Activity Level" value={orderData.order_details.activity_level} />
                <DataRow label="Socket Type" value={orderData.order_details.socket_type} />
                <DataRow label="Design Variation" value={orderData.order_details.design_variation} />
                <DataRow label="Model Name" value={orderData.order_details.model_name} />
                <DataRow label="Stump Length" value={orderData.order_details.stump_length ? `${orderData.order_details.stump_length} cm` : ""} />
                <DataRow label="Stump Size" value={orderData.order_details.stump_size} />
                <DataRow label="Foot Type" value={orderData.order_details.foot_type} />
                <DataRow label="Shoe Size" value={orderData.order_details.shoe_size} />
                <DataRow label="Flexion Angle" value={orderData.order_details.flexion_angle} />
                <DataRow label="Add/Abd Angle" value={orderData.order_details.add_abd_angle} />
                <DataRow label="Stump Type" value={orderData.order_details.stump_type} />
                <DataRow label="Stump Condition" value={orderData.order_details.stump_condition} />
                <DataRow label="Previous Prosthetic Experience" value={orderData.order_details.previous_prosthetic_experience} isLast={true} />
              </div>
            </Section>

            {/* Step 2: Scan */}
            <Section title="Scan" stepNumber={2}>
              <div className="grid grid-cols-1  gap-0">
                <DataRow label="Direct Body" value={orderData.order_details.direct_body} />
                <DataRow label="Liner Thickness" value={orderData.order_details.liner_thickness} />
                <DataRow label="Liner Type" value={orderData.order_details.liner_type} />
                <DataRow label="Foot Amputation" value={orderData.order_details.foot_Amputation} />
                <DataRow label="Upload Link" value={orderData.order_details.upload_link} isLast={true} />
              </div>
            </Section>

            {/* Step 3: Locking Mechanism */}
            <Section title="Locking Mechanism" stepNumber={3}>
              <div className="grid grid-cols-1  gap-0">
                <DataRow label="Locking System" value={orderData.order_details.locking_system} />
                <DataRow label="File Dimensions" value={orderData.order_details.file_dimensions} isLast={true} />
              </div>
            </Section>

            {/* Step 4: Modifications */}
            <Section title="Modifications" stepNumber={4}>
              <div className="grid grid-cols-1  gap-0">
                <DataRow label="Global Volume Reduction" value={orderData.order_details.global_volume_reduction} />
              </div>
              
              {/* Socket Design Details */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Socket Design Details:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1  lg:grid-cols-2 gap-2">
                    {orderData.order_details.socket_design_details.map((detail, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div className="font-medium text-sm">{detail.area} - {detail.area_name}</div>
                        <div className="text-xs text-gray-600">Default: {detail.default_mm}mm</div>
                        {detail.cpo_input_mm && (
                          <div className="text-xs text-blue-600">CPO Input: {detail.cpo_input_mm}mm</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Step 5: Finishing */}
            <Section title="Finishing" stepNumber={5}>
              <div className="grid grid-cols-1  gap-0">
                <DataRow label="Model Name" value={orderData.order_details.model_name} />
                <DataRow label="Design By" value={orderData.order_details.Design_by} />
                <DataRow label="Print By" value={orderData.order_details.Print_by} />
                <DataRow label="Latices" value={orderData.order_details.Latices} />
                <DataRow label="Finish Type" value={orderData.order_details.finish_type} />
                <DataRow label="GST 5%" value={orderData.order_details.gst_5 ? `₹${orderData.order_details.gst_5}` : ""} />
                <DataRow label="GST 18%" value={orderData.order_details.gst_18 ? `₹${orderData.order_details.gst_18}` : ""} />
                <DataRow label="Item Discount" value={orderData.order_details.item_discount ? `₹${orderData.order_details.item_discount}` : ""} />
                <DataRow label="Additional Discount" value={orderData.order_details.additional_discount ? `₹${orderData.order_details.additional_discount}` : ""} isLast={true} />
              </div>
            </Section>
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={() => setOpen(false)} variant={'outline'}>
              Close
            </Button>
            <Button onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default OrderSummaryModal;