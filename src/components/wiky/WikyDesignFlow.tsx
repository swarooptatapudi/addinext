// src/components/wiky/WikyDesignFlow.tsx

import { useEffect } from "react";
import { WikyProduct } from "./types";
import { useWikySession } from "./useWikySession";

type Props = {
  orderId: string;
  product?: WikyProduct;
};

export function WikyDesignFlow({
                                 orderId,
                                 product = "INSOLES",
                               }: Props) {
  const wiky = useWikySession(orderId, product);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.event === "customFormSubmitted") {
        wiky.submitForm(e.data.scanId, e.data.formResponseId);
      }

      if (e.data?.EVENT_NAME === "loaded_IFrame") {
        const iframe = document.getElementById("wiky_iframe");
        if (iframe instanceof HTMLIFrameElement) {
          iframe.contentWindow?.postMessage(e.data, "*");
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [wiky]);


  return (
    <div>
      <h3>Wiky Design – {product}</h3>

      {wiky.error && <div style={{ color: "red" }}>{wiky.error}</div>}

      {wiky.step === "START" && (
        <button onClick={wiky.start}>Start Design</button>
      )}

      {wiky.step === "UPLOAD" && (
        <input
          type="file"
          accept=".zip"
          onChange={(e) =>
            e.target.files && wiky.uploadZip(e.target.files[0])
          }
        />
      )}

      {(wiky.step === "PRESCRIPTION" ||
        wiky.step === "CLEANING" ||
        wiky.step === "DESIGN") && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => wiky.openIframe("CLEANING")}>
            Cleaning
          </button>
          <button onClick={() => wiky.openIframe("DESIGN")}>
            Design
          </button>
        </div>
      )}

      {wiky.iframeUrl && (
        <iframe
          id="wiky_iframe"
          src={wiky.iframeUrl}
          width="100%"
          height="600"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}

      {wiky.step === "FILES" && (
        <ul>
          {wiky.files.map((f, i) => (
            <li key={i}>
              <a href={f.path} target="_blank">{f.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
