export interface WikyCaptureIframeProps {
  /** Wiky config (resolved by backend, passed by parent) */
  iframeBaseUrl: string;        // https://scan.wikyapps.com
  customFormId: string;         // f096efe4-93d6-4306-accf-c62ca4b3c4fe
  clientId: string;             // resolved from backend
  userId?: string;              // optional (future)

  /** Context (for parent reference only) */
  product: 'INSOLES' | 'BK' | 'AK' | 'AFO' | 'SPINAL_BRACE';

  /** Callbacks */
  onCaptured: (payload: {
    scanId: string;
    formResponseId: string;
  }) => void;

  onCancel?: () => void;
}
