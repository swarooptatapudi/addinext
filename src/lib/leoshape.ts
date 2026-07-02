/**
 * LeoShape postMessage event bus types and payload builders.
 *
 * Import these in any component that needs to communicate
 * with the LeoShape iframe.
 *
 * LeoShape integration spec:
 *   https://leoafo-demo.leopoly.com (refer to integration PDFs)
 */

// ---------------------------------------------------------------------------
// Event name constants
// ---------------------------------------------------------------------------

export const LEOSHAPE_EVENTS = {
  /** Fired by the iframe when it is fully loaded and ready to receive data. */
  LOADED: 'loaded_IFrame',

  /** Sent BY the host to initialise the editor with scan data. */
  INIT_DATA: 'init_data',

  /** Fired by the iframe when the user triggers an export. */
  EXPORT_START: 'model_export_start',

  /** Sent BY the host to approve the pending export. */
  EXPORT_APPROVED: 'model_export_approved',

  /** Fired by the iframe when the export files are ready. */
  EXPORT_FINISHED: 'export_finished',

  /** Fired by the iframe when the user closes/exits the editor. */
  CLOSED: 'closed_IFrame',
} as const;

export type LeoShapeEventName =
  (typeof LEOSHAPE_EVENTS)[keyof typeof LEOSHAPE_EVENTS];

// ---------------------------------------------------------------------------
// Message shapes
// ---------------------------------------------------------------------------

export interface LeoShapeBaseMessage {
  EVENT_NAME: LeoShapeEventName;
  message_ID?: string;
}

/** init_data payload sent to the iframe after loaded_IFrame fires. */
export interface LeoShapeInitData extends LeoShapeBaseMessage {
  EVENT_NAME: 'init_data';
  message_ID: string;
  data: {
    scan_import_data: {
      right: LeoShapeScanFile;
      left: LeoShapeScanFile;
    };
    export_URL: string;
    export_format: 'obj' | 'stl';
    file_name_data: {
      patient_name: string;
      version: number;
      order_id: string;
    };
    /** Previously exported insole parameters for re-editing. Empty on first run. */
    insole_parameters?: Record<string, unknown>;
  };
}

export interface LeoShapeScanFile {
  /** Public download URL for the scan file. */
  url: string;
  /** Scan mode as specified by the order type. */
  scanMode: 'semi-weighted' | 'non-weighted' | 'weighted';
  /** File format of the scan. */
  format: 'stl' | 'obj';
}

/** Payload sent by the host to approve a pending export. */
export interface LeoShapeExportApproved extends LeoShapeBaseMessage {
  EVENT_NAME: 'model_export_approved';
  /** Must match the message_ID from the model_export_start event. */
  message_ID: string;
}

/** Payload received from the iframe when export completes. */
export interface LeoShapeExportFinished extends LeoShapeBaseMessage {
  EVENT_NAME: 'export_finished';
  data: {
    left?:     { file_name: string };
    right?:    { file_name: string };
    metadata?: { file_name: string };
  };
}

// ---------------------------------------------------------------------------
// Payload builders (convenience helpers)
// ---------------------------------------------------------------------------

/**
 * Build an export-approved message to send back to the iframe
 * when model_export_start is received.
 */
export function buildExportApproved(
  messageId: string
): LeoShapeExportApproved {
  return {
    EVENT_NAME: LEOSHAPE_EVENTS.EXPORT_APPROVED,
    message_ID: messageId,
  };
}

/**
 * Derive the allowed postMessage origin from the iframe URL string.
 * Returns null if the URL is invalid.
 */
export function getLeoShapeOrigin(iframeUrl: string): string | null {
  try {
    return new URL(iframeUrl).origin;
  } catch {
    return null;
  }
}
