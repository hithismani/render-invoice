'use client';

import { useEffect, useState } from 'react';
import Invoice from '@/components/Invoice';
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
    <div style={{ width: '900px', margin: '0 auto', background: '#fff' }}>
      <Invoice
        invoice={invoice}
        performValidation={false}
        printView={true}
      />
    </div>
  );
}
