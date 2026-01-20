import { FormikProps } from "formik";
import { AFOOrderPayload } from "./AFOOrderPayload";

export default function AFOMeasurementsStep({
                                              formik,
                                            }: {
  formik: FormikProps<AFOOrderPayload>;
}) {
  const isDAFO = formik.values.product_type === "DAFO";

  const Field = (name: keyof AFOOrderPayload, label: string) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type="number"
        {...formik.getFieldProps(name)}
        className="w-full border p-2 rounded"
      />
      {formik.touched[name] &&
        typeof formik.errors[name] === "string" && (
          <p className="text-red-500 text-xs">{formik.errors[name]}</p>
        )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        {Field("heel_to_sulcus_cm", "Heel to Sulcus")}
        {Field("heel_to_toe_cm", "Heel to Toe")}
        {Field("fibula_head_circumference_cm", "Fibula Head Circumference")}
        {Field("fibula_head_ml_cm", "Fibula Head M–L")}
        {Field("fibula_head_to_ankle_cm", "Fibula Head → Ankle Height")}
        {Field("widest_calf_circumference_cm", "Widest Calf Circumference")}
        {Field("widest_calf_ml_cm", "Widest Calf M–L")}
        {Field("ankle_circumference_cm", "Ankle Circumference")}
        {Field("ankle_ml_cm", "Ankle M–L")}
        {Field("ankle_to_ground_cm", "Ankle → Ground")}
        {Field("forefoot_ml_cm", "Forefoot M–L")}

        {isDAFO && (
          <div>
            <label className="text-sm font-semibold">Ankle Joint Type</label>
            <select
              {...formik.getFieldProps("ankle_joint_type")}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="Tamrack flexure">Tamrack flexure</option>
              <option value="Oklahoma">Oklahoma</option>
              <option value="Camber axis">Camber axis</option>
            </select>
          </div>
        )}
      </div>

      <div className="border rounded p-4 text-center">
        <img
          src="/measurements/afo.png"
          alt="Measurement diagram"
          className="mx-auto"
        />
        <p className="text-sm mt-2">
          {isDAFO ? "DAFO Measurement Diagram" : "AFO Measurement Diagram"}
        </p>
      </div>
    </div>
  );
}
