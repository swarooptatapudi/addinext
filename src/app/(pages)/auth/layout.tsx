import React from "react";

export default function AuthLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
  --primary: #583CA3;
  --primary-light: #7047ff;
  --primary-dark: #432e7d;
  --text-main: #111827;
  --text-muted: #6b7280;
  --left-panel-bg: #f8f8f8;
  --right-panel-bg: #ffffff;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

body, html, #__next { height: 100%; }

body {
  min-height: 100vh;
  background: url('/background.png') center center / cover no-repeat fixed;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  padding: 10px;
  overflow-y: auto;
}

body::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 0;
}

.shell {
  margin-top: 24px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: 0.6fr 0.4fr;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0,0,0,0.4);
  position: relative;
  z-index: 1;
}

/* LEFT PANEL */
.left-panel {
  color: var(--text-main);
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--left-panel-bg);
}

/* MATCHED EXACTLY TO HTML LOGO SIZE */
.main-heading {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 0;
  color: var(--primary-dark);
}

.subtitle {
  font-size: 14px;
  margin-bottom: 15px;
  color: var(--text-muted);
}

.headline {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--primary);
  line-height: 1.3;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary-dark);
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: 600;
  opacity: 0.8;
}

.list {
  list-style: none;
  font-size: 12px;
  margin-bottom: 10px;
}

.list li {
  margin-bottom: 4px;
  padding-left: 18px;
  position: relative;
  font-weight: 500;
  color: var(--text-main);
  line-height: 1.2;
}

.list li::before {
  content: '›';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.9rem;
  color: var(--primary-light);
  font-weight: 900;
  line-height: 1;
}

.workflow-image-container {
  margin-top: 15px;
  text-align: center;
  margin-bottom: 15px;
}

.workflow-image-container img {
  max-width: 80%;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.tagline {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  margin-top: 15px;
}

/* RIGHT PANEL */
.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
  background-color: var(--right-panel-bg);
  border-left: 1px solid rgba(0,0,0,0.05);
}

.card {
  width: 100%;
  max-width: 360px;
}

/* Responsive */
@media (max-width: 1000px) {
  body { padding: 0; }
  .shell {
    grid-template-columns: minmax(0, 1fr);
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
    min-height: 100vh;
    max-height: none;
    overflow-y: auto;
  }
  .left-panel { padding: 15px; border-right: none; }
  .right-panel { padding: 15px; background-color: var(--right-panel-bg); border-top: 1px solid rgba(0,0,0,0.05); }
  .workflow-image-container { margin-top: 10px; margin-bottom: 10px; }
}
            `,
          }}
        />

        <div className="shell">
          <div className="left-panel">

            <h1 className="main-heading">ADDINxT</h1>
            <div className="subtitle">Digital O&amp;P Platform</div>

            <div>
              <div className="headline">
                Empowering Orthotic &amp; Prosthetic Centers with a complete digital workflow.
              </div>

              <div className="section-title">Core Modules Include</div>
              <ul className="list">
                <li>Scanning – Capture accurate 3D patient scans.</li>
                <li>Clinical Assessment – Record &amp; analyze patient data.</li>
                <li>CAD/CAM Designing – Customize designs with precision.</li>
                <li>3D Printing – Manufacture with accuracy &amp; efficiency.</li>
                <li>Order Management – Manage orders, approvals &amp; transactions.</li>
              </ul>

              <div className="workflow-image-container">
                <img src="/workflow.png" alt="The Process Workflow" />
              </div>
            </div>

            <p className="tagline">
              Simplifying patient care through innovation and technology.
            </p>
          </div>

          <div className="right-panel">
            <div className="card">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
