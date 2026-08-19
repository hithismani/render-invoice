'use client';

import { useEffect, useState } from 'react';
import SatoriPreview from '@/components/SatoriPreview';
import { exampleInvoice, type Invoice as InvoiceData } from '@/schema/invoiceSchema';
import { decodeShareHash } from '@/lib/share';

export default function PrintViewClient() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const shared = decodeShareHash(window.location.hash);
    setInvoice(shared || exampleInvoice);
  }, []);

  if (!invoice) return null;

  return (
    <div
      id="invoice-content"
      data-autosize={invoice.autoSize === false ? '0' : '1'}
      style={{ width: '900px', margin: '0 auto', background: '#fff' }}
    >
      <SatoriPreview invoice={invoice} />
    </div>
  );
}
