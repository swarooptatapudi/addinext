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
    </div>
  );
};