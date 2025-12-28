"use client";

import { useEffect, useState } from "react";

export default function TestWikyPage() {
  const [scanId, setScanId] = useState("");
  const [formResponseId, setFormResponseId] = useState("");

  const [form, setForm] = useState({
    name: "",
    surname: "",
    birthDate: "",
    weight: "",
    shoeSize: "",
    sex: "m",
  });

  function openWikyPopup() {
    window.open(
      "/wiky-capture",
      "wikyPopup",
      "width=1100,height=800"
    );
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "WIKY_CAPTURED") {
        setScanId(event.data.scanId);
        setFormResponseId(event.data.formResponseId);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function updateField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submitAll() {
    const payload = {
      identifier: "none",
      scanId,
      formResponseId,
      patientData: form,
    };
    console.log("FINAL PAYLOAD:", payload);
    alert("Payload logged to console");
  }

  return (
    <div style={pageStyle}>
      <h2>Test Wiky – Final Capture</h2>

      <div style={card}>
        <button style={primaryBtn} onClick={openWikyPopup}>
          Open Wiky Scan
        </button>

        <div style={grid}>
          <Field label="First Name">
            <input name="name" value={form.name} onChange={updateField} />
          </Field>

          <Field label="Surname">
            <input name="surname" value={form.surname} onChange={updateField} />
          </Field>

          <Field label="Birth Date">
            <input type="date" name="birthDate" value={form.birthDate} onChange={updateField} />
          </Field>

          <Field label="Sex">
            <select name="sex" value={form.sex} onChange={updateField}>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </Field>

          <Field label="Weight (kg)">
            <input type="number" name="weight" value={form.weight} onChange={updateField} />
          </Field>

          <Field label="Shoe Size">
            <input type="number" name="shoeSize" value={form.shoeSize} onChange={updateField} />
          </Field>
        </div>

        <hr />

        <div style={grid}>
          <Field label="Wiky Scan ID">
            <input value={scanId} readOnly />
          </Field>

          <Field label="Form Response ID">
            <input value={formResponseId} readOnly />
          </Field>
        </div>

        <button
          style={{ ...primaryBtn, marginTop: 16 }}
          disabled={!scanId || !formResponseId}
          onClick={submitAll}
        >
          Submit All Data
        </button>
      </div>
    </div>
  );
}

/* ---------- Small helpers ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

/* ---------- Styles ---------- */

const pageStyle: React.CSSProperties = {
  padding: 32,
  maxWidth: 900,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 24,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginTop: 16,
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 16px",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
