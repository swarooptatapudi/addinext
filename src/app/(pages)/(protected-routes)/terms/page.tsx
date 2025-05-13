
'use client';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Addiwise Technologies - Terms and Conditions</title>
        <meta name="description" content="Addiwise Technologies terms and conditions" />
      </Head>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-500 px-6 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Terms and Conditions </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
           
            <div className="space-y-8">

            <p className="font-semibold mb-8 text-gray-700 border-b pb-4">
              By accepting the estimate and payment, you are hereby agreeing all the terms and conditions as under:
            </p>

              {/* Section 1 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                  Introduction
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>
                    Addiwise Technologies specializes in delivering customized, durable, and lightweight orthotics and prosthetics. 
                    Through our advanced digital process, we enhance patient comfort and mobility by leveraging precision 3D scanning, 
                    AI-driven design, and additive manufacturing technologies. This term and conditions refer to intend to buy Addiwise 
                    products and services.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                  Definitions
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li><span className="font-semibold">"Addiwise"</span> - Addiwise Technologies Pvt Ltd</li>
                  <li><span className="font-semibold">"Customer or User"</span> – The user who wants to buy Addiwise products and services</li>
                  <li><span className="font-semibold">"O&P"</span> - orthotics and prosthetics</li>
                  <li><span className="font-semibold">"AddiNxT"</span> – the online design and order platform of Addiwise</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                  Acceptance of Terms
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>By using the site, customers/users agree to the terms and conditions.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                  Modification of Terms
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>Addiwise reserves the right to modify the terms at any time without any prejudice and will be immediately binding to all transactions.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">5</span>
                  Account Registration
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>By using or logging to AddiNxT the user accepts all terms and conditions, and will be responsible for maintaining account security.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">6</span>
                  Ordering and Payment
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>By proceeding further, the user hereby confirms that he or she understands the process of using the portal and understands his or her liability of accepting the terms.</li>
                  <li>The user also understands that payment is NON-REFUNDABLE and the decision on the order is entirely prerogative of Addiwise.</li>
                  <li>For any more information on the ordering process, please write a mail to <a href="mailto:sales@addiwise.com" className="text-blue-600 hover:underline">sales@addiwise.com</a>.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">7</span>
                  Shipping and Delivery
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>The shipping and delivery will be done on best effort basis. Any delay in delivery for any reason; Addiwise will not be responsible.</li>
                  <li>Addiwise will be responsible for good quality delivery and if the part delivered is damaged or broken; the user will intimate Addiwise within 24 hours of receipt of material with sufficient proofs to <a href="mailto:sales@addiwise.com" className="text-blue-600 hover:underline">sales@addiwise.com</a>; failing which all obligations on Addiwise will cease.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">8</span>
                  Returns and Refunds
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>Please refer <Link href="https://www.addiwise.com/op/Return&refund/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.addiwise.com/op/Return&refund/</Link> for the refund or return.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">9</span>
                  Product Descriptions
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>We strive for accuracy in product descriptions but do not guarantee that descriptions are error-free.</li>
                  <li>The user is advised to verify the design and inputs before proceeding to place order or payment.</li>
                  <li>User also confirmed.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">10</span>
                  Intellectual Property
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>Addiwise is the owner of AddiNxt and all products and services offered by it. However all products, logos and trademarks of other companies are of their respective companies.</li>
                  <li>Any replication of any content, workflow etc. from AddiNxt is prohibited.</li>
                </ul>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">11</span>
                  Limitation of Liability
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>The user hereby agrees to indemnify Addiwise of any damages arising from the use of the site or products.</li>
                  <li>
                    Force Majeure – Addiwise shall not be liable for any failure or delay in performance under these terms and conditions 
                    when such failure or delay results from causes beyond their reasonable control, including but not limited to acts of God, 
                    war, terrorism, civil unrest, government restrictions, natural disasters, strikes, or other labor disturbances, electrical 
                    or internet service disruptions, or any other event that is unforeseeable and unavoidable. The obligations of the affected 
                    party shall be suspended for the duration of the force majeure event, and the time for performance shall be extended accordingly.
                  </li>
                </ul>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">12</span>
                  Governing Law
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>Any arbitration or jurisdiction and laws that govern the terms and conditions will be governed by Court of Hyderabad, India only.</li>
                </ul>
              </section>

              {/* Section 13 */}
              <section>
                <h2 className="text-xl font-bold text-gray-700 mb-2 mt-5 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">13</span>
                  Contact Information
                </h2>
                <ul className="list-disc pl-10 space-y-2 text-gray-700">
                  <li>For customer service or inquiries related to the terms please write to <a href="mailto:sales@addiwise.com" className="text-blue-600 hover:underline">sales@addiwise.com</a>.</li>
                </ul>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            {/* <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p> */}
            <Link href="#" className="text-blue-600 hover:underline text-sm">
              Back to top
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}