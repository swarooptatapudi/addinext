import React from 'react';
import Image from 'next/image';

type UISet = {
  RadioGroup: any;
  RadioGroupItem: any;
  SelectBox: any;
  Label: any;
  Input?: any;
  Textarea?: any;
};

type Props = {
  values: any;
  errors?: any;
  touched?: any;
  setFieldValue: (field: string, value: any) => void;
  handleChange?: (field: string) => (val: any) => void;
  shouldShowError?: (field: string, required?: boolean) => boolean;
  UI: UISet;
};

const IMG = {
  // 7–10 will appear near Positional Diagnosis
  occipital:  '/assets/order-forms/cranial/image7.png',
  parietal:   '/assets/order-forms/cranial/image8.png',
  frontal:    '/assets/order-forms/cranial/image9.png',
  ear:        '/assets/order-forms/cranial/image10.png',
  // 11–12 will appear near Torticollis
  positional: '/assets/order-forms/cranial/image11.png',
  severity:   '/assets/order-forms/cranial/image12.png',
};

const TEXT = {
  sectionTitle: 'Clinical Assessment',
  occipital: 'Occipital Area',
  parietal: 'Parietal Area',
  frontal: 'Frontal Area',
  earAlignment: 'Ear Alignment',
  positionalDiagnosis: 'Positional Diagnosis',
  severity: 'Severity',
  torticollis: 'Torticollis',
  postSurgical: 'Post Surgical',
  sutureType: 'Suture Type (Surgical only)',

  rightFlatteningGtLeft: 'Right Flattening > Left',
  leftFlatteningGtRight: 'Left Flattening > Right',
  bilateralFlattening: 'Bi-lateral Flattening',

  rightAnteriorShift: 'Right Anterior Shift',
  leftAnteriorShift: 'Left Anterior Shift',
  noEarShift: 'No Ear Shift',

  plagio: 'Plagiocephaly',
  brachy: 'Brachycephaly',
  scapho: 'Scaphocephaly',
  asymBrachy: 'Asymmetrical Brachycephaly (Combo)',
  asymScapho: 'Asymmetrical Scaphocephaly',

  light: 'Light',
  moderate: 'Moderate',
  severe: 'Severe',

  tortRight: 'Right',
  tortLeft: 'Left',
  tortNone: 'None',

  cranialVaultRemolding: 'Cranial Vault Remolding',
  endoscopicStripCraniectomy: 'Endoscopic Strip Craniectomy',

  sutures: [
    'Right Coronal',
    'Right Lambdoid',
    'Sagittal',
    'Left Coronal',
    'Left Lambdoid',
    'Metopic',
    'Bi-Coronal',
    'Bi-Lambdoid',
  ],
};

export default function Assessment({
                                     values,
                                     errors,
                                     setFieldValue,
                                     handleChange,
                                     shouldShowError,
                                     UI
                                   }: Props) {
  const { RadioGroup, RadioGroupItem, SelectBox, Label } = UI;

  const areaOptions = [
    { label: 'Right Flattening > Left', value: 'Right Flattening > Left' },
    { label: 'Left Flattening > Right', value: 'Left Flattening > Right' },
    { label: 'Bi-lateral Flattening',   value: 'Bi-lateral Flattening' },
    { label: 'N/A',                      value: 'N/A' },
  ];
  const earOptions = [
    { label: TEXT.rightAnteriorShift, value: 'Right Anterior Shift' },
    { label: TEXT.leftAnteriorShift, value: 'Left Anterior Shift' },
    { label: TEXT.noEarShift, value: 'No Ear Shift' },
  ];
  const positionalOptions = [
    { value: 'P', label: TEXT.plagio },
    { value: 'B', label: TEXT.brachy },
    { value: 'ASB', label: TEXT.asymBrachy },
    { value: 'SC', label: TEXT.scapho },
    { value: 'ASYS', label: TEXT.asymScapho },
  ];
  const severityOptions = [
    { value: 'L', label: TEXT.light },
    { value: 'M', label: TEXT.moderate },
    { value: 'S', label: TEXT.severe },
  ];
  const torticollisOptions = [
    { label: TEXT.tortRight, value: 'Right' },
    { label: TEXT.tortLeft, value: 'Left' },
    { label: TEXT.tortNone, value: 'None' },
  ];

  const toggleCsv = (
    field: 'post_surgical' | 'suture_type_surgical_diagnoses_only',
    val: string
  ) => {
    const cur = (values[field] as string | undefined) || '';
    const parts = new Set(cur.split(',').map((s) => s.trim()).filter(Boolean));
    parts.has(val) ? parts.delete(val) : parts.add(val);
    setFieldValue(field, Array.from(parts).join(', '));
  };

  const CardShell: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
                                                                                                   title,
                                                                                                   children,
                                                                                                   className,
                                                                                                 }) => (
    <div className={`border rounded-xl bg-white shadow-sm p-5 ${className || ''}`}>
      <Label className="text-gray-800 font-semibold mb-3 block">{title}</Label>
      {children}
    </div>
  );

  const RadioList = ({
                       name,
                       value,
                       options,
                     }: {
    name: string;
    value: string;
    options: { label: string; value: string }[];
  }) => (
    <RadioGroup value={value} onValueChange={(v: string) => setFieldValue(name, v)}>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const id = `${name}-${opt.value}`.replace(/\s+/g, '_');
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={opt.value} />
              <Label htmlFor={id} className="text-sm">
                {opt.label}
              </Label>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-primary text-lg font-semibold border-b pb-2">Assessment</h2>

      {/* Top: four radio cards (no images) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CardShell title={TEXT.occipital}>
          <RadioList name="occipital_area" value={values.occipital_area || ''} options={areaOptions} />
        </CardShell>

        <CardShell title={TEXT.parietal}>
          <RadioList name="parietal_area" value={values.parietal_area || ''} options={areaOptions} />
        </CardShell>

        <CardShell title={TEXT.frontal}>
          <RadioList name="frontal_area" value={values.frontal_area || ''} options={areaOptions} />
        </CardShell>

        <CardShell title={TEXT.earAlignment}>
          <RadioList name="ear_alignment" value={values.ear_alignment || ''} options={earOptions} />
        </CardShell>
      </div>

      {/* Middle: Positional Diagnosis with images 7–10 stacked on the side */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardShell title={TEXT.positionalDiagnosis}>
          <SelectBox
            options={positionalOptions}
            label=""
            value={values.positional ?? ''}
            onValueChange={handleChange ? handleChange('positional') : (v: string) => setFieldValue('positional', v)}
            inVaild={shouldShowError ? shouldShowError('positional') : false}
            required={false}
            error={errors?.positional}
            placeholder="Select"
          />
        </CardShell>

        {/* side image column spans 2 on lg for ample width */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[IMG.occipital, IMG.parietal, IMG.frontal, IMG.ear].map((src, i) => (
            <div key={src} className="h-32 md:h-36 border rounded-md bg-white relative overflow-hidden">
              <Image src={src} alt={`reference ${i + 7}`} fill sizes="(max-width:768px) 160px, 200px" className="object-contain p-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Next row: Torticollis with images 11–12 on the side */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardShell title={TEXT.torticollis}>
          <RadioList name="torticollis" value={values.torticollis || ''} options={torticollisOptions} />
        </CardShell>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[IMG.positional, IMG.severity].map((src, i) => (
            <div key={src} className="h-32 md:h-36 border rounded-md bg-white relative overflow-hidden">
              <Image src={src} alt={`reference ${i + 11}`} fill sizes="(max-width:768px) 160px, 200px" className="object-contain p-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: Severity + Post Surgical side by side */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardShell title={TEXT.severity}>
          <SelectBox
            options={severityOptions}
            label=""
            value={values.severity ?? ''}
            onValueChange={handleChange ? handleChange('severity') : (v: string) => setFieldValue('severity', v)}
            inVaild={shouldShowError ? shouldShowError('severity') : false}
            required={false}
            error={errors?.severity}
            placeholder="Select"
          />
        </CardShell>

        <CardShell title={TEXT.postSurgical}>
          <div className="flex flex-col gap-2 text-sm">
            <Label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-primary"
                checked={(values.post_surgical || '').includes(TEXT.cranialVaultRemolding)}
                onChange={() => toggleCsv('post_surgical', TEXT.cranialVaultRemolding)}
              />
              {TEXT.cranialVaultRemolding}
            </Label>
            <Label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-primary"
                checked={(values.post_surgical || '').includes(TEXT.endoscopicStripCraniectomy)}
                onChange={() => toggleCsv('post_surgical', TEXT.endoscopicStripCraniectomy)}
              />
              {TEXT.endoscopicStripCraniectomy}
            </Label>
          </div>
        </CardShell>
      </div>

      {/* Full width: Suture Type */}
      <div className="mt-6">
        <CardShell title={TEXT.sutureType}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-sm">
            {TEXT.sutures.map((opt) => {
              const checked = (values.suture_type_surgical_diagnoses_only || '').includes(opt);
              return (
                <Label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={checked}
                    onChange={() => toggleCsv('suture_type_surgical_diagnoses_only', opt)}
                  />
                  {opt}
                </Label>
              );
            })}
          </div>
        </CardShell>
      </div>
    </div>
  );
}
