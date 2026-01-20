import { FormikProps } from "formik";
import { AFOOrderPayload } from "./AFOOrderPayload";

export default function ScanUpload({
                                     formik,
                                   }: {
  formik: FormikProps<AFOOrderPayload>;
}) {
  const laterality = formik.values.laterality;

  return (
    <div className="space-y-4">
      <select {...formik.getFieldProps("laterality")}>
        <option value="Unilateral">Unilateral</option>
        <option value="Bilateral">Bilateral</option>
      </select>

      {(laterality === "Unilateral" || laterality === "Bilateral") && (
        <input
          type="file"
          onChange={(e) =>
            formik.setFieldValue("left_leg_file", e.currentTarget.files?.[0])
          }
        />
      )}

      {laterality === "Bilateral" && (
        <input
          type="file"
          onChange={(e) =>
            formik.setFieldValue("right_leg_file", e.currentTarget.files?.[0])
          }
        />
      )}

      <input {...formik.getFieldProps("drive_url")} placeholder="Drive URL" />
    </div>
  );
}
