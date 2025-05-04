import { SelectBox } from "@/components/ui/selectbox";

export const Step5 = ({
  values,
  errors,
  touched,
  setFieldValue,
  FORM_OPTIONS
}: any) => {
  const isAddiEase = values.model_name === 'AddiEase';
  const isAddiEaseEco = values.model_name === 'AddiEaseEco';
  const showFinishOptions = isAddiEase || isAddiEaseEco;

  // Finish options configuration
  const getFinishOptions = () => {
    if (isAddiEase) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'colour', label: 'colour', color: 'bg-neutral-500 text-neutral-100' },
      ];
    } else if (isAddiEaseEco) {
      return [
        { value: 'bead-blasting', label: 'Bead Blasting', color: 'bg-gray-500 text-gray-700' },
        { value: 'black-dye', label: 'Black Dye', color: 'bg-black text-black' },
        { value: 'epoxy', label: 'Epoxy', color: 'bg-slate-500 text-slate-100' }
      ];
    }
    return [];
  };

  const finishOptions = getFinishOptions();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold mt-5">Design & Printing</h3>
      
      {/* Design By Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div className="flex items-center">
          <label className="font-sm min-w-[100px] text-sm">Design by :</label>
          <div className="w-[250px]">
            <SelectBox
              options={FORM_OPTIONS.Design_by || []}
              value={values.Design_by}
              onValueChange={(value) => setFieldValue('Design_by', value)}
              inVaild={!!errors.Design_by && !!touched.Design_by}
              required
            />
            {errors.Design_by && touched.Design_by && (
              <p className="text-red-500 text-xs mt-1">{errors.Design_by}</p>
            )}
          </div>
        </div>
      </div>

      {/* Print By Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-2">
        <div className="flex items-center">
          <label className="font-medium min-w-[100px] text-sm">Print by :</label>
          <div className="w-[250px]">
            <SelectBox
              options={FORM_OPTIONS.Print_by || []}
              value={values.Print_by}
              onValueChange={(value) => setFieldValue('Print_by', value)}
              inVaild={!!errors.Print_by && !!touched.Print_by}
              required
            />
            {errors.Print_by && touched.Print_by && (
              <p className="text-red-500 text-xs mt-1">{errors.Print_by}</p>
            )}
          </div>
        </div>
        
      </div>

      {/* Lattices Section (Only for AddiEase) */}
      {isAddiEase && (
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          <div className="flex items-center">
            <label className="font-medium min-w-[100px] text-sm">Extras Latices:</label>
            <div className="w-[250px]">
              <SelectBox
                options={FORM_OPTIONS.Latices || []}
                value={values.Latices || ''}
                onValueChange={(value) => setFieldValue('Latices', value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Finish Section */}
          {showFinishOptions ? (
      <div className="space-y-4 mt-5">
        <label className="font-medium text-sm">Finish:</label>
        <div className="ml-10 mb-5">
            <div className="flex items-center gap-10 -mt-7 ml-8">
              {finishOptions.map((option) => (
                <label key={option.value} className="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    name="finish_type"
                    value={option.value}
                    checked={values.finish_type === option.value}
                    onChange={() => setFieldValue('finish_type', option.value)}
                    className="sr-only peer"
                  />
                  <div className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                    values.finish_type === option.value 
                      ? 'border-blue-200 ring-2 ring-blue-300' 
                      : 'border-gray-300'
                  }`} />
                  <span className="text-sm mt-1 capitalize">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          
          {errors.finish_type && touched.finish_type && (
            <p className="text-red-500 text-xs mt-1">{errors.finish_type}</p>
          )}
        </div>
      </div>
        ) : (
          <div className="ml-26 text-gray-500"></div>
        )}

      {/* Information Section Footer for remove in feture use */}
      {/* <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="p-2 bg-blue-50 rounded">
              <p className="font-medium text-sm text-gray-700">If Design by Self, and Print by Self</p>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <p className="font-medium text-sm text-gray-700">If Design by Self, and Print by Addiwise</p>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <p className="font-medium text-sm text-gray-700">If Design by Addiwise and Print by Addiwise</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded md:w-[495px]">
              <p className="font-medium text-sm text-gray-700">Sales Order is Created at Zero Cost</p>
              <p className="font-medium text-sm text-gray-700">AddiCoin shall be consumed for Design and Sales Order is Created - Print order</p>
              <p className="text-xs text-gray-500 mt-1">
                Two Suborders will be created - One for Design and One for Print
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-xs text-gray-500">
                <li>Design Sub Order will pick price from Design Price List</li>
                <li>Print Sub Order will pick price from Print Price List</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="p-4 bg-blue-50 rounded text-center ml-40">
              <p className="font-medium text-sm text-gray-700">Integration with</p>
              <p className="font-semibold text-blue-600 mt-1">Payment Gateway</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};