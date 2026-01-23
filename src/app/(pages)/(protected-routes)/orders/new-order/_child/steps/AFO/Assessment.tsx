import { FormikProps } from "formik";
import { AFOOrderPayload } from "./AFOOrderPayload";

export default function Assessment({
                                     formik,
                                   }: {
  formik: FormikProps<AFOOrderPayload>;
}) {
  return (
    <div className="space-y-4">
      <input {...formik.getFieldProps("clinic_name")} placeholder="Clinic Name" />
      <input type="date" {...formik.getFieldProps("assessment_date")} />

      <textarea
        {...formik.getFieldProps("medical_condition")}
        placeholder="Medical Condition"
      />
      <textarea
        {...formik.getFieldProps("treatment_suggested")}
        placeholder="Treatment Suggested"
      />
      <textarea
        {...formik.getFieldProps("special_instructions")}
        placeholder="Special Instructions"
      />
    </div>
  );
}
