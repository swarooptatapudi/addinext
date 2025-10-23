import React from 'react';
import Image from 'next/image';

type Props = {
  cr?: number;
  cvai?: number;
  UI: { Card: any; Label: any; Input: any };
};

const CR_IMG = '/assets/order-forms/cranial/cr.png';
const CVAI_IMG = '/assets/order-forms/cranial/cvai.png';

export default function Computation({ cr, cvai, UI }: Props) {
  const { Card, Label, Input } = UI;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Computation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* === CR === */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-36 h-36 relative flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
              <Image
                src={CR_IMG}
                alt="Cephalic Ratio (CR) diagram"
                fill
                className="object-contain p-2"
                sizes="144px"
                priority
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label className="block">CR (Cephalic Ratio)</Label>
              <Input readOnly value={cr ?? ''} placeholder="auto" className="text-center bg-gray-100" />
            </div>
          </div>
        </Card>

        {/* === CVAI === */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-36 h-36 relative flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden">
              <Image
                src={CVAI_IMG}
                alt="Cranial Vault Asymmetry Index (CVAI) diagram"
                fill
                className="object-contain p-2"
                sizes="144px"
                priority
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label className="block">CVAI (%)</Label>
              <Input readOnly value={cvai ?? ''} placeholder="auto" className="text-center bg-gray-100" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
