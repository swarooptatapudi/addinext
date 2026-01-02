"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TestWikyPage() {
  const [scanId, setScanId] = useState('');
  const [formResponseId, setFormResponseId] = useState('');

  // ✅ NEW (minimal)
  const [insoleOrderId, setInsoleOrderId] = useState('INS-ORD-00427');
  const [product, setProduct] = useState('INSOLES');
  // ✅ API progress + output (MISSING STATES)
  const [progress, setProgress] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  const [userId, setUserId] = useState("rohit.gupta@sarainfoway.in");
  const [clientId, setClientId] = useState("ba004e9f-f569-4ae2-9793-3a2607fdecac");
  const [apiPayload,setApiPayload]=useState<any>('');

  const [form, setForm] = useState({
    name: "",
    surname: "",
    birthDate: "",
    weight: "",
    shoeSize: "",
    sex: "m",
    rightFile: "",
    leftFile: "",
  });


  // const [form, setForm] = useState({
  //   name: 'AMber',
  //   surname: 'Agrawal',
  //   birthDate: '1965-02-02', // ✅ must be YYYY-MM-DD for <input type="date">
  //   weight: '76',
  //   shoeSize: '32',
  //   sex: 'm',
  //   rightFile: 'amber__plantarSurface_right.stl',
  //   leftFile: 'amber__plantarSurface_left.stl'
  // });

  // ❗ UNCHANGED
  function openWikyPopup() {
    window.open('/wiky-capture', 'wiky', 'width=1100,height=800');
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'WIKY_CAPTURED') {
        setScanId(e.data.scanId);
        setFormResponseId(e.data.formResponseId);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // // ✅ payload now includes order + product
  // function buildPayload() {
  //   console.log("READY PAYLOAD", {
  //     insole_order_id: insoleOrderId,
  //     product,
  //     scanId,
  //     formResponseId,
  //     patient: form,
  //   });
  //   alert("Payload logged to console");
  // }
  async function buildPayload() {
    if (!scanId) {
      alert('Scan ID missing. Complete Wiky scan first.');
      return;
    }

    setProgress(0);
    setApiResponse('');
    setApiError('');

    const payload = {
      identifier: 'none',
      ID: scanId, // ✅ FROM POPUP
      userId: 'cf34cd1a-362c-45f1-9be6-45f9ff329a63', // ✅ AS PROVIDED BY YOU
      clientId: 'bd06e687-113d-461f-8c87-9f5d7f823a59', // ✅ AS PROVIDED BY YOU - c023f568-8562-4a1a-b81c-a673a5770c67
      data: {
        'Patient Data': {
          name: form.name,
          surname: form.surname,
          birthDate: form.birthDate,
          weight: Number(form.weight || 0),
          shoeSize: Number(form.shoeSize),
          sex: form.sex
        },
        files: [form.rightFile, form.leftFile],
        'Device Info': {
          appVersion: '2.00',
          device: 'Not registered',
          ios: 'Not registered',
          app: 'Addiwise'
        }
      }
    };
    const payloadString = JSON.stringify(payload, null, 2);
    console.log("WIKY PAYLOAD:", payload);
    console.log("WIKY PAYLOAD STRING:", payloadString);
    setApiPayload(payloadString);
    try {
      const res = await axios.post(
        'https://wpm30sdhfd.execute-api.eu-west-1.amazonaws.com/prod/scan',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress(percent);
          }
        }
      );

      // setApiPayload(load);
      setApiResponse(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setApiError(err?.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
  }
  function loadTestData() {
    setInsoleOrderId("INS-ORD-00427");
    setProduct("INSOLES");

    setForm({
      name: "AMber",
      surname: "Agrawal",
      birthDate: "1965-02-02", // input type="date" needs YYYY-MM-DD
      weight: "76",
      shoeSize: "32",
      sex: "m",
      rightFile: "amber_plantarSurface_right.stl",
      leftFile: "amber_plantarSurface_left.stl",
    });

    // optional: clear previous results
    setScanId("");
    setFormResponseId("");
    setProgress(0);
    setApiResponse("");
    setApiError("");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Test Wiky – Final Capture</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-5xl">
        {/* ✅ ORDER / PRODUCT (NEW, SAFE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <Field label="Insole Order ID">
            <input
              className="input"
              value={insoleOrderId}
              onChange={(e) => setInsoleOrderId(e.target.value)}
              placeholder="INS-ORD-2025-0001"
            />
          </Field>

          <Field label="Product">
            <select className="input" value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="INSOLES">INSOLES</option>
            </select>
          </Field>
          <Field label="Wiky User ID">
            <input
              className="input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user@example.com"
            />
          </Field>

          <Field label="Wiky Client ID">
            <input
              className="input font-mono"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </Field>
          <button
            type="button"
            onClick={loadTestData}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition"
          >
            Load Test Data
          </button>
        </div>

        {/* ❗ ACTION — UNCHANGED */}
        <button
          onClick={openWikyPopup}
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition"
        >
          Open Wiky Selection
        </button>

        {/* ❗ FORM GRID — UNCHANGED */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="First Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Surname">
            <input
              className="input"
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
            />
          </Field>

          <Field label="Birth Date">
            <input
              type="date"
              className="input"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </Field>

          <Field label="Sex">
            <select
              className="input"
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
            >
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </Field>

          <Field label="Weight (kg)">
            <input
              className="input"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </Field>

          <Field label="Shoe Size">
            <input
              className="input"
              value={form.shoeSize}
              onChange={(e) => setForm({ ...form, shoeSize: e.target.value })}
            />
          </Field>

          <Field label="Right STL File">
            <input
              className="input"
              placeholder="*_plantarSurface_right.stl"
              value={form.rightFile}
              onChange={(e) => setForm({ ...form, rightFile: e.target.value })}
            />
          </Field>

          <Field label="Left STL File">
            <input
              className="input"
              placeholder="*_plantarSurface_left.stl"
              value={form.leftFile}
              onChange={(e) => setForm({ ...form, leftFile: e.target.value })}
            />
          </Field>
        </div>

        {/* ❗ META — UNCHANGED */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
          <p>
            <span className="font-medium">Scan ID:</span>{' '}
            <span className="font-mono">{scanId}</span>
          </p>
          <p className="mt-1">
            <span className="font-medium">Form Response ID:</span>{' '}
            <span className="font-mono">{formResponseId}</span>
          </p>
        </div>

        {/* ❗ SUBMIT — UNCHANGED */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={buildPayload}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition"
          >
            Submit All Data
          </button>
        </div>
        {/* PROGRESS */}
        {progress > 0 && (
          <div className="mt-4 text-sm text-gray-700">
            Upload Progress: <strong>{progress}%</strong>
          </div>
        )}

        {/* RESPONSE */}
        { apiPayload && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
            <div className="font-semibold text-green-700 mb-1">API Payload</div>
            <pre className="whitespace-pre-wrap break-all">{apiPayload}</pre>
          </div>
        )}

        {/* RESPONSE */}
        {apiResponse && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
            <div className="font-semibold text-green-700 mb-1">API Response</div>
            <pre className="whitespace-pre-wrap break-all">{apiResponse}</pre>
          </div>
        )}

        {/* ERROR */}
        {apiError && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
            <div className="font-semibold text-red-700 mb-1">API Error</div>
            <pre className="whitespace-pre-wrap break-all">{apiError}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small helper ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
