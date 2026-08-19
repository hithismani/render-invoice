export default function Disclaimer() {
  return (
    <div data-section="disclaimer" className="mt-6 p-6 bg-gradient-to-r from-yellow-50/90 to-yellow-50/70 border border-yellow-200/50 rounded-xl shadow-sm mb-3">
      <div className="flex flex-col items-start space-y-3">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-yellow-800">Notice</p>
        </div>
        <div className="text-left space-y-1 text-yellow-700">
          <p className="text-sm">
            Invoicely does not verify totals, calculations, or tax rates. Please check all line items and legal requirements before sending. To hide this message, check the verification box under Options in the editor.
          </p>
        </div>
      </div>
    </div>
  );
}
