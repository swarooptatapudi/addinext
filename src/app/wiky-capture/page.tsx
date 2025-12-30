// "use client";
//
// import { useEffect, useState } from "react";
//
// const WIKY_IFRAME_URL =
//   "https://scan.wikyapps.com/custom-form/view-custom-form/32f37890-b03f-4b3f-8569-f4f783acd812" +
//   "?clientID=ba004e9f-f569-4ae2-9793-3a2607fdecac";
//
// export default function WikyCapturePage() {
//   const [done, setDone] = useState(false);
//
//   useEffect(() => {
//     function onMessage(event: MessageEvent) {
//       // 🔴 IMPORTANT: inspect payload once in console
//       console.log("WIKY MESSAGE", event.data);
//
//       // Example payload – adjust keys if Wiky changes
//       const scanId = event.data?.scanId;
//       const formResponseId = event.data?.formResponseId;
//
//       if (scanId && formResponseId) {
//         // Send to parent
//         window.opener?.postMessage(
//           {
//             type: "WIKY_CAPTURED",
//             scanId,
//             formResponseId
//           },
//           "*"
//         );
//
//         setDone(true);
//
//         // Close popup after short delay
//         setTimeout(() => window.close(), 500);
//       }
//     }
//
//     window.addEventListener("message", onMessage);
//     return () => window.removeEventListener("message", onMessage);
//   }, []);
//
//   if (done) {
//     return <p>Captured. Closing...</p>;
//   }
//
//   return (
//     <div style={{ height: "100vh" }}>
//       <iframe
//         src={WIKY_IFRAME_URL}
//         style={{ width: "100%", height: "100%", border: "none" }}
//         allow="camera *; microphone *"
//       />
//     </div>
//   );
// }
"use client";

import { useEffect } from "react";
// f096efe4-93d6-4306-accf-c62ca4b3c4fe
const IFRAME_URL =
  "https://scan.wikyapps.com/custom-form/view-custom-form/f096efe4-93d6-4306-accf-c62ca4b3c4fe?clientID=c023f568-8562-4a1a-b81c-a673a5770c67";

export default function WikyCapturePage() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.event === "customFormSubmitted") {
        window.opener?.postMessage(
          {
            type: "WIKY_CAPTURED",
            scanId: e.data.scanId,
            formResponseId: e.data.formResponseId,
          },
          "*"
        );
        window.close();
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      src={IFRAME_URL}
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
