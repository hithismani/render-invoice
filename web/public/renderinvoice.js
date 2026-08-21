/*!
 * RenderInvoice Playground — shared embed (schema-adapted, dependency-free).
 * Source of truth mirror of web/schema/invoiceSchema.ts + SatoriInvoiceTemplate.tsx.
 *
 * Serve from web/public (Next serves /renderinvoice.js) or any CDN. Consumers:
 *   RenderInvoicePlayground.mount('#app', { invoice?, exposeGlobals? })
 *   RenderInvoicePlayground.render(invoiceJson)  -> html string
 *   RenderInvoicePlayground.validate(invoiceJson)-> [{path,message}]
 */
var RenderInvoicePlayground = (function () {
  'use strict';

  var VERSION = '1.0.0';

  var CSS = `
  .rip-root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#fafafa;color:#18181b;font-size:14px;line-height:1.5;min-height:100vh;display:flex;flex-direction:column}
  .rip-root *,.rip-root *::before,.rip-root *::after{box-sizing:border-box}
  .rip-root button{font-family:inherit;cursor:pointer}
  .rip-root input,.rip-root textarea,.rip-root select{font-family:inherit}

  .rip-root .ri-topbar{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid #e4e4e7;height:56px;display:flex;align-items:center;gap:10px;padding:0 16px}
  .rip-root .ri-brand{font-weight:700;font-size:14px;white-space:nowrap}
  .rip-root .ri-brand span{color:#a1a1aa;font-weight:500}
  .rip-root .ri-docwrap{flex:1;min-width:0;display:flex;align-items:center;gap:8px}
  .rip-root .ri-docinput{flex:0 1 340px;min-width:120px;border:1px solid transparent;background:#f4f4f5;border-radius:8px;padding:6px 10px;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#3f3f46}
  .rip-root .ri-docinput:focus{outline:none;background:#fff;border-color:#a1a1aa}
  .rip-root .ri-saved{font-size:11px;color:#a1a1aa;white-space:nowrap}
  .rip-root .btn{border:1px solid #e4e4e7;background:#fff;color:#3f3f46;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:500;display:inline-flex;align-items:center;gap:6px;transition:.15s}
  .rip-root .btn:hover{background:#f4f4f5}
  .rip-root .btn.primary{background:#18181b;color:#fff;border-color:#18181b}
  .rip-root .btn.primary:hover{background:#3f3f46}

  .rip-root .ri-main{flex:1;width:100%;max-width:1600px;margin:0 auto;padding:20px 16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:20px;align-items:start}
  @media (max-width:1023px){.rip-root .ri-main{grid-template-columns:1fr}}
  .rip-root .card{background:#fff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04)}

  .rip-root .edtabs{display:flex;align-items:center;gap:2px;border-bottom:1px solid #f4f4f5;padding:0 12px;background:#fff}
  .rip-root .edtab{position:relative;border:0;background:none;padding:11px 14px;font-size:14px;font-weight:500;color:#71717a}
  .rip-root .edtab:hover{color:#3f3f46}
  .rip-root .edtab.active{color:#18181b}
  .rip-root .edtab.active::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:2px;background:#18181b;border-radius:2px}
  .rip-root .edhint{margin-left:auto;font-size:12px;color:#a1a1aa;padding-bottom:10px}
  .rip-root .pane{padding:16px}

  .rip-root .banner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;padding:12px 14px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px;font-size:13px;color:#78350f}
  .rip-root .banner .row{display:flex;gap:8px}
  .rip-root .btn.amber{background:#d97706;border-color:#d97706;color:#fff}
  .rip-root .btn.amber:hover{background:#b45309}

  .rip-root details.sec{border:1px solid #f4f4f5;border-radius:10px;margin-bottom:14px;background:#fff}
  .rip-root details.sec[open]{border-color:#e4e4e7}
  .rip-root details.sec>summary{list-style:none;cursor:pointer;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:10px}
  .rip-root details.sec>summary:hover{background:#fafafa}
  .rip-root details.sec>summary::-webkit-details-marker{display:none}
  .rip-root .sec-t{font-size:15px;font-weight:600;color:#18181b}
  .rip-root .sec-d{font-size:12px;color:#71717a;margin-top:2px;max-width:52ch}
  .rip-root .chev{width:16px;height:16px;color:#a1a1aa;transition:transform .15s;flex-shrink:0}
  .rip-root details[open]>summary .chev{transform:rotate(180deg)}
  .rip-root .sec-body{padding:0 16px 16px}

  .rip-root .formnav{display:flex;gap:4px;margin-bottom:14px;position:sticky;top:56px;z-index:30;background:#fff;padding:6px 0;border-radius:8px}
  .rip-root .fnav{flex:1;text-align:left;border:0;background:none;padding:8px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#71717a;display:inline-flex;align-items:center;justify-content:center;gap:6px}
  .rip-root .fnav:hover{background:#fafafa;color:#3f3f46}
  .rip-root .fnav.active{background:#f4f4f5;color:#18181b}
  .rip-root .fbadge{min-width:16px;height:16px;border-radius:999px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;display:inline-grid;place-items:center;padding:0 4px}
  .rip-root .issues{margin-bottom:14px;padding:10px 12px;border-radius:8px;background:#fefce8;border:1px solid #fde68a;color:#854d0e;font-size:13px}

  .rip-root .inp{width:100%;padding:8px 10px;border:1px solid #e4e4e7;border-radius:6px;font-size:13px;background:#fff;color:#18181b;transition:border-color .15s}
  .rip-root .inp:hover{border-color:#d4d4d8}
  .rip-root .inp:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.15)}
  .rip-root .inp.invalid{border-color:#f87171}
  .rip-root textarea.inp{resize:vertical;line-height:1.55}
  .rip-root .mb{margin-bottom:8px}
  .rip-root .lbl{font-size:12px;font-weight:500;color:#52525b;margin-bottom:6px;display:block}
  .rip-root .hint{font-size:11px;color:#a1a1aa;margin:2px 0 8px}
  .rip-root .ferr{margin-top:4px;font-size:12px;color:#dc2626}
  .rip-root .ferr:empty{display:none}

  .rip-root .pill{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;font-size:12px;font-weight:500;border-radius:999px;border:1px dashed #e4e4e7;background:#fff;color:#27272a;transition:.15s}
  .rip-root .pill:hover{background:#f4f4f5}
  .rip-root .pill.blue{color:#1d4ed8;border-color:#bfdbfe}
  .rip-root .pill.blue:hover{background:#eff6ff}
  .rip-root .pill svg{width:13px;height:13px}

  .rip-root .kvrow{display:flex;gap:8px;align-items:flex-start;border:1px solid #e4e4e7;border-radius:10px;padding:10px;background:#fff;margin-bottom:8px}
  .rip-root .kvrow .grow{flex:1;min-width:0}
  .rip-root .ordbtns{display:flex;flex-direction:column;gap:2px}
  .rip-root .obtn{border:1px solid #e4e4e7;background:#fff;border-radius:5px;width:20px;height:18px;font-size:9px;line-height:1;color:#71717a;display:grid;place-items:center;padding:0}
  .rip-root .obtn:hover{background:#f4f4f5;color:#18181b}
  .rip-root .dbtn{border:1px dashed #e4e4e7;background:#fff;color:#dc2626;border-radius:999px;padding:5px 9px;font-size:12px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
  .rip-root .dbtn:hover{background:#fef2f2}
  .rip-root .dbtn svg{width:13px;height:13px}
  .rip-root .recip{border:1px solid #e4e4e7;border-radius:10px;padding:14px;background:#fafafa;margin-bottom:12px}

  .rip-root .chip{padding:4px 9px;font-size:11px;border-radius:6px;border:1px solid #e4e4e7;background:#fff;color:#52525b}
  .rip-root .chip:hover{border-color:#d4d4d8}
  .rip-root .chip.on{border-color:#2563eb;background:#eff6ff;color:#1e40af}
  .rip-root .chips{display:flex;flex-wrap:wrap;gap:6px}
  .rip-root .seg{display:inline-flex;border:1px solid #e4e4e7;border-radius:8px;padding:2px;background:#fff}
  .rip-root .seg button{border:0;background:none;padding:6px 12px;font-size:12px;border-radius:6px;color:#52525b}
  .rip-root .seg button.on{background:#18181b;color:#fff}
  .rip-root .variant{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .rip-root .vbtn{text-align:left;padding:12px;border-radius:10px;border:1px solid #e4e4e7;background:#fff}
  .rip-root .vbtn:hover{border-color:#d4d4d8}
  .rip-root .vbtn.on{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.12);background:rgba(239,246,255,.4)}
  .rip-root .vbtn b{display:block;font-size:14px;color:#18181b;text-transform:capitalize}
  .rip-root .vbtn i{font-style:normal;font-size:11px;color:#71717a}
  .rip-root .swatches{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .rip-root .sw{width:26px;height:26px;border-radius:999px;border:2px solid #fff;box-shadow:0 0 0 1px #e4e4e7}
  .rip-root .sw:hover{transform:scale(1.1)}
  .rip-root .colorrow{display:flex;gap:8px;align-items:center}
  .rip-root .colorrow input[type=color]{width:52px;height:38px;padding:2px;border:1px solid #e4e4e7;border-radius:6px;background:#fff;cursor:pointer}
  .rip-root .imgsize{display:flex;gap:8px}
  .rip-root .imgsize .inp{width:90px}
  .rip-root .check{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:#27272a}
  .rip-root .check input{width:15px;height:15px;accent-color:#2563eb}

  .rip-root .jsonwarn{margin-bottom:12px;padding:10px 12px;border-radius:8px;background:#fffbeb;border:1px solid #fde68a;font-size:12px;color:#78350f;display:flex;gap:8px;align-items:flex-start}
  .rip-root .lnk{color:#92400e;text-decoration:underline;cursor:pointer;font-weight:500;background:none;border:0;padding:0;font-size:12px}
  .rip-root .jerr{margin-top:10px;padding:8px 10px;border-radius:6px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12px;white-space:pre-wrap}
  .rip-root .jerr:empty{display:none}
  .rip-root .edfoot{padding:12px 16px;border-top:1px solid #f4f4f5;background:rgba(250,250,250,.6);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .rip-root .kbds{font-size:11px;color:#71717a}
  .rip-root kbd{padding:2px 6px;border-radius:4px;background:#fff;border:1px solid #e4e4e7;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:#3f3f46}
  .rip-root .issuecount{font-size:12px;color:#dc2626;font-weight:500}
  .rip-root .issuecount:empty{display:none}

  .rip-root .pvbar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #f4f4f5;background:#fff}
  .rip-root .dots{display:inline-flex;gap:6px;margin-right:8px}
  .rip-root .dots i{width:10px;height:10px;border-radius:999px;display:block}
  .rip-root .pvfile{font-size:12px;font-weight:500;color:#52525b;font-family:ui-monospace,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
  .rip-root .live{font-size:10px;border:1px solid #e4e4e7;border-radius:999px;padding:2px 8px;color:#71717a}
  .rip-root .ri-previewScroll{background:rgba(244,244,245,.6);padding:16px;overflow:auto;max-height:70vh}
  @media (min-width:1024px){.rip-root .ri-previewScroll{max-height:calc(100vh - 180px)}}
  .rip-root .ri-scaleWrap{transform-origin:top left;width:900px}
  .rip-root .ri-invPage{width:900px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.1)}

  .rip-root .toast{position:fixed;bottom:20px;right:20px;z-index:100;background:#18181b;color:#fff;padding:8px 16px;border-radius:10px;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;transform:translateY(6px)}
  .rip-root .toast.show{opacity:1;transform:none}

  .rip-root .schemalist{max-height:340px;overflow:auto;border:1px solid #f4f4f5;border-radius:8px;margin-top:10px}
  .rip-root .schemalist table{width:100%;border-collapse:collapse;font-size:12px}
  .rip-root .schemalist td{padding:7px 10px;border-bottom:1px solid #f4f4f5;vertical-align:top}
  .rip-root .schemalist td:first-child{font-family:ui-monospace,Menlo,monospace;color:#1e40af;white-space:nowrap}
  .rip-root .schemalist td:nth-child(3){color:#71717a}

  /* Invoice sheet */
  .ri-inv{--accent:#2563eb;--accent-dark:#1d4ed8;color:#111827;position:relative;width:900px;background:#fff}
  .ri-inv .inv{display:flex;flex-direction:column;gap:14px;padding:32px 0 24px;position:relative}
  .ri-inv .inv.bold{gap:16px;padding-top:0}
  .ri-inv .px{padding-left:48px;padding-right:48px}
  .ri-inv p{margin:0}
  .ri-inv a{color:inherit}
  .ri-inv .cancelbadge{position:absolute;top:0;right:0;background:#ef4444;color:#fff;padding:8px 16px;font-size:13px;font-weight:600;z-index:10}
  .ri-inv .headblock{display:flex;flex-direction:column;gap:8px}
  .ri-inv .headblock.center{align-items:center;text-align:center}
  .ri-inv .headblock.left{align-items:flex-start;text-align:left}
  .ri-inv .headblock.right{align-items:flex-end;text-align:right}
  .ri-inv h1.phead{margin:0;font-size:24px;font-weight:700;color:#1f2937;line-height:1.25}
  .ri-inv .pdesc{font-size:14px;color:#4b5563;line-height:1.5}
  .ri-inv .disc{margin-top:16px;margin-bottom:12px;padding:16px;border-radius:8px;background:rgba(254,252,232,.9);border:1px solid rgba(254,240,138,.5)}
  .ri-inv .disc-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .ri-inv .disc-bang{width:18px;height:18px;background:#a16207;color:#fff;border-radius:4px;font-size:12px;font-weight:700;display:grid;place-items:center}
  .ri-inv .disc-t{font-size:13px;font-weight:600;color:#854d0e}
  .ri-inv .disc-x{font-size:12px;color:#a16207;line-height:1.5}
  .ri-inv .parties{display:flex;flex-wrap:wrap;gap:12px}
  .ri-inv .pcard{flex:1 1 220px;min-width:0;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:4px}
  .ri-inv .fld{font-size:13px;line-height:1.5;color:#111827;word-break:break-word}
  .ri-inv .fld .fl{font-weight:500}
  .ri-inv .bp{display:flex;flex-direction:column;gap:6px;min-width:0}
  .ri-inv .bp-k{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:4px;word-break:break-word}
  .ri-inv .bp-v{font-size:14px;font-weight:600;color:#18181b;word-break:break-word}
  .ri-inv .metarow{display:flex;flex-wrap:wrap;gap:16px}
  .ri-inv .mi{display:flex;flex-direction:column;gap:2px;min-width:120px}
  .ri-inv .mi-k{font-size:12px;color:#6b7280;font-weight:500}
  .ri-inv .mi-v{font-size:13px;color:#1f2937}
  .ri-inv .tbl{margin:0 48px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
  .ri-inv .tr{display:flex;gap:8px;padding:10px 16px;border-bottom:1px solid #f3f4f6;align-items:stretch}
  .ri-inv .tr:last-child{border-bottom:0}
  .ri-inv .th{display:flex;gap:8px;padding:12px 16px;border-bottom:1px solid #e5e7eb}
  .ri-inv .tc{min-width:0;word-break:break-word;font-size:13px;color:#111827}
  .ri-inv .thc{min-width:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:var(--accent)}
  .ri-inv .r{text-align:right}
  .ri-inv .sumwrap{display:flex;justify-content:flex-end}
  .ri-inv .sum{width:320px;display:flex;flex-direction:column;gap:6px}
  .ri-inv .srow{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid #f3f4f6}
  .ri-inv .srow.last{border-top:2px solid var(--accent);margin-top:6px}
  .ri-inv .sl{font-size:13px;color:#6b7280}
  .ri-inv .sl.last{color:#111827;font-weight:700}
  .ri-inv .sv{font-size:13px;color:#111827;font-weight:500}
  .ri-inv .sv.last{font-size:16px;color:var(--accent);font-weight:700}
  .ri-inv .sig{padding:0 48px}
  .ri-inv .sig img,.ri-inv .headblock img{object-fit:contain;max-width:100%}
  .ri-inv .foot{display:flex;flex-direction:column;gap:4px}
  .ri-inv .ft{font-size:16px;font-weight:600;color:#111827;line-height:1.4}
  .ri-inv .fb{font-size:13px;color:#6b7280;line-height:1.5}
  .ri-inv .email{font-size:13px;font-weight:500;color:#1f2937}
  .ri-inv .cnote{margin:0 48px;background:#ef4444;color:#fff;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:600}
  .ri-inv .copy{font-size:12px;color:#6b7280}
  .ri-inv .builtwith{font-size:10px;color:#9ca3af}
  .ri-inv .editstrip{height:22px;margin-top:4px;border-top:1px solid #a1a1aa;background:#fafafa}
  .ri-inv .inv.bold .bhead{padding:40px 48px;border-radius:8px 8px 0 0;background-image:linear-gradient(135deg,var(--accent),var(--accent-dark));color:#fff}
  .ri-inv .inv.bold .bhead-row{display:flex;align-items:flex-start;gap:24px}
  .ri-inv .inv.bold .bhead-row.rev{flex-direction:row-reverse}
  .ri-inv .inv.bold .blogobox{background:#fff;border-radius:6px;padding:8px}
  .ri-inv .inv.bold .bht{flex:1;min-width:0}
  .ri-inv .inv.bold .bht.right{text-align:right}
  .ri-inv .inv.bold .beyebrow{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:.8}
  .ri-inv .inv.bold .bnum{font-size:36px;font-weight:800;margin-top:4px;line-height:1.15}
  .ri-inv .inv.bold .bdesc{font-size:14px;opacity:.8;margin-top:8px;line-height:1.5}
  .ri-inv .inv.bold .parties{gap:16px}
  .ri-inv .inv.bold .pcard{border:0;padding:0;flex-basis:240px}
  .ri-inv .inv.bold .metabox{margin:0 48px;padding:16px;border-radius:8px;flex-wrap:wrap;display:flex;gap:16px}
  .ri-inv .inv.bold .metabox .mi-k{font-size:11px;color:#71717a;font-weight:600}
  .ri-inv .inv.bold .metabox .mi-v{font-weight:600;color:#18181b}
  .ri-inv .inv.bold .btbl{margin:0 48px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden}
  .ri-inv .inv.bold .bth{background:var(--accent);color:#fff;display:flex;gap:8px;padding:12px 16px}
  .ri-inv .inv.bold .bth .thc{color:#fff}
  .ri-inv .inv.bold .btr{display:flex;gap:8px;padding:12px 16px}
  .ri-inv .inv.bold .btr.alt{background:#fafafa}
  .ri-inv .inv.bold .btr .tc{color:#27272a}
  .ri-inv .inv.bold .bsum{width:320px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
  .ri-inv .inv.bold .bsrow{display:flex;justify-content:space-between;gap:12px;padding:10px 16px}
  .ri-inv .inv.bold .bsrow.alt{background:#fafafa}
  .ri-inv .inv.bold .bsrow.last{background:var(--accent)}
  .ri-inv .inv.bold .bsrow .sl{color:#52525b}
  .ri-inv .inv.bold .bsrow .sv{color:#18181b;font-weight:500}
  .ri-inv .inv.bold .bsrow.last .sl,.ri-inv .inv.bold .bsrow.last .sv{color:#fff;font-weight:700}
  .ri-inv .inv.bold .bsrow.last .sv{font-size:16px}
  .ri-inv .inv.bold .mbcards{display:flex;flex-wrap:wrap;gap:16px;padding:0 48px}
  .ri-inv .inv.bold .mbcard{flex:1;min-width:180px;padding:16px;border-radius:8px;background:#fafafa;border:1px solid #f4f4f5}
  .ri-inv .inv.bold .mbcard .mi-k{font-size:11px;font-weight:600;color:#71717a;margin-bottom:2px}
  .ri-inv .inv.bold .mbcard .mi-v{font-size:13px;color:#3f3f46}
  .ri-inv .inv.bold .sig-l{font-size:11px;color:#71717a;margin-bottom:4px}
  .ri-inv .inv.bold .bfoot{margin:0 48px;padding-top:16px;border-top:1px solid #e4e4e7;display:flex;flex-direction:column;gap:4px}
  .ri-inv .inv.bold .bfoot .ft{font-size:14px;color:#18181b}
  .ri-inv .inv.bold .bfoot .fb{font-size:12px;color:#71717a}
  .ri-inv .inv.bold .cnote{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-weight:400;padding:8px 12px}
  .ri-inv .inv.bold .copy{font-size:11px;color:#71717a}
  .ri-inv .mdh{font-weight:700;line-height:1.3}
  .ri-inv .mdh1{font-size:22px}.ri-inv .mdh2{font-size:20px}.ri-inv .mdh3{font-size:18px}.ri-inv .mdh4{font-size:16px}.ri-inv .mdh5{font-size:15px}.ri-inv .mdh6{font-size:14px}.ri-inv .mdh7{font-size:13px}
  .ri-inv .mdp{line-height:1.5}
  .ri-inv .mdul,.ri-inv .mdol{margin:2px 0;padding-left:20px}
  .ri-inv .mdq{margin:2px 0;padding:2px 10px;border-left:3px solid #d4d4d8;color:#52525b}
  .ri-inv .mdsp{height:6px}
  .ri-inv code{background:#f4f4f5;border-radius:4px;padding:1px 5px;font-family:ui-monospace,Menlo,monospace;font-size:.92em}

  body.ri-printing > :not(.rip-root){display:none!important}
  body.ri-printing .rip-root .ri-topbar,body.ri-printing .rip-root .editor-card,body.ri-printing .rip-root .pvbar,body.ri-printing .rip-root .toast,body.ri-printing .rip-root .banner{display:none!important}
  body.ri-printing .rip-root .ri-main{display:block;padding:0;max-width:none}
  body.ri-printing .rip-root .preview-card{border:0;box-shadow:none;border-radius:0}
  body.ri-printing .rip-root .ri-previewScroll{overflow:visible!important;max-height:none!important;padding:0!important;background:#fff!important}
  body.ri-printing .rip-root .ri-scaleWrap{transform:none!important;width:auto!important;height:auto!important;margin:0!important}
  @media print{body{margin:0;background:#fff}@page{margin:12mm}}
  `;

  function injectCss() {
    if (document.getElementById('ri-embed-css')) return;
    var s = document.createElement('style');
    s.id = 'ri-embed-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ═══ Schema mirror — web/schema/invoiceSchema.ts ═══ */

  var FONTS = ['Inter', 'Source Serif 4', 'IBM Plex Sans', 'Playfair Display', 'Space Grotesk', 'DM Sans', 'Fraunces', 'Libre Baskerville', 'Instrument Sans', 'Newsreader'];

  var SCHEMA_DOC = [
    { k: 'design', t: '"classic" | "bold" = "classic"', d: 'Visual variant. "bold" uses an accent header.' },
    { k: 'font', t: 'string?', d: 'One of: ' + FONTS.join(', ') + '. Default Inter; unknown names fall back to Inter.' },
    { k: 'accentColor', t: 'string = "#2563eb"', d: 'Hex color threaded through headings, totals, and borders.' },
    { k: 'logoPosition', t: '"center" | "left" | "right"', d: 'Where the logo sits in the header.' },
    { k: 'direction', t: '"ltr" | "rtl"', d: 'Reading direction. Use "rtl" for Arabic, Hebrew, Urdu, Farsi.' },
    { k: 'autoSize', t: 'boolean = true', d: 'Automatically fit content to the page when generating PDF.' },
    { k: 'filename', t: 'string?', d: 'Filename for the generated PDF.' },
    { k: 'invoiceHeading', t: 'string?', d: 'Main heading or title (e.g., "Invoice"). Required if present.' },
    { k: 'invoiceDescription', t: 'string?', d: 'Subtitle. Full markdown: **bold** *italic* ~~strike~~ `code` [label](url) headings, {@18} size, lists, quotes. Line breaks kept.' },
    { k: 'invoiceFrom', t: 'Record<string,string>', d: 'Sender key-value pairs. Keys and values accept markdown incl. size overrides.' },
    { k: 'invoiceTo', t: 'Array<Record<string,string>>', d: 'Recipients as key-value objects. Markdown supported.' },
    { k: 'metaTop', t: 'Record<string,string>', d: 'Metadata above line items. Markdown supported.' },
    { k: 'metaBottom', t: 'Record<string,string> = {}', d: 'Metadata below line items. Markdown supported.' },
    { k: 'columns', t: 'string[] (min 1)', d: 'Column headers for the line items table. Markdown supported.' },
    { k: 'lineItems', t: 'Array<Record<string,string|number>> (min 1)', d: 'Cells aligned with columns. Currency glyphs and markdown supported. Keys must exist in columns.' },
    { k: 'summary', t: 'Array<{label, value}> (min 1)', d: 'Label (required) and value (required, string|number). Markdown supported.' },
    { k: 'logoUrl', t: 'string?', d: 'http(s) URL or data URL.' },
    { k: 'logoSize', t: '{width,height}?', d: 'Positive pixel dimensions.' },
    { k: 'digitalSignatureUrl', t: 'string?', d: 'http(s) URL or data URL.' },
    { k: 'signatureSize', t: '{width,height}?', d: 'Positive pixel dimensions.' },
    { k: 'footerText', t: '{topText?, bottomText?}', d: 'Full markdown, single newlines kept, size overrides.' },
    { k: 'isCancelled', t: 'boolean?', d: 'Shows the cancelled badge.' },
    { k: 'cancelledNotes', t: 'string?', d: 'Notes shown when cancelled. Same markdown as description.' },
    { k: 'amountsVerifiedHideDisclaimer', t: 'boolean = false', d: 'If false, a verification disclaimer is displayed.' },
    { k: 'showBuiltWith', t: 'boolean = false', d: 'Shows a small "Built with RenderInvoice" line.' },
    { k: 'includeEditLink', t: 'boolean?', d: 'Adds the footer edit-link strip (PDF only).' }
  ];

  var DEFAULTS = {
    design: 'classic',
    accentColor: '#2563eb',
    logoPosition: 'center',
    direction: 'ltr',
    autoSize: true,
    metaBottom: {},
    amountsVerifiedHideDisclaimer: false,
    showBuiltWith: false
  };

  var EXAMPLE = {
    design: 'classic',
    accentColor: '#2563eb',
    logoPosition: 'center',
    direction: 'ltr',
    autoSize: true,
    filename: '',
    invoiceHeading: 'Invoice for Services Rendered',
    invoiceDescription: 'This invoice covers the services provided in September.',
    invoiceFrom: {
      'Issued By': 'Example Corp.',
      Address: '123 Example Street\nExample City, EX 12345',
      Email: 'info@example.com',
      'Tax ID': 'EX-123456789',
      Website: 'www.example.com',
      Phone: '+1 (555) 123-4567',
      'Business Hours': 'Mon-Fri: 9AM-5PM'
    },
    invoiceTo: [
      {
        'Bill To': 'Acme Corp.',
        Address: '456 Acme Avenue\nAcme City, AC 67890',
        Email: 'billing@acmecorp.com',
        'Account Number': 'ACC-789012',
        'VAT Number': 'VAT-456789',
        'Payment Terms': 'Net 30'
      },
      {
        'Ship To': 'Acme Corp. Warehouse',
        Address: '789 Warehouse Blvd\nAcme City, AC 67890',
        'Shipping Method': 'Standard Ground',
        'Tracking Number': 'TRK-123456',
        'Delivery Instructions': 'Leave at front desk'
      }
    ],
    metaTop: {
      'Invoice Number': 'INV-20231001',
      'Invoice Date': '2023-09-30',
      'Due Date': '2023-10-15'
    },
    metaBottom: {
      Terms: 'Payment due within 30 days',
      Notes: 'Thank you for your business'
    },
    columns: ['Description', 'Quantity', 'Unit Price', 'Total'],
    lineItems: [
      { Description: 'Consulting Services', Quantity: 10, 'Unit Price': '$150', Total: '$1500' }
    ],
    summary: [
      { label: 'Subtotal', value: '$3500' },
      { label: 'Tax', value: '$350' },
      { label: 'Total', value: '$3850' }
    ],
    logoUrl: 'https://placehold.co/150x50.png?text=Example+Corp+Logo',
    logoSize: { width: 150, height: 50 },
    digitalSignatureUrl: 'https://placehold.co/200x50.png?text=Signature',
    signatureSize: { width: 200, height: 50 },
    footerText: {
      topText: 'Thank you for your business!',
      bottomText: 'Please make payment by the due date.'
    },
    isCancelled: false,
    amountsVerifiedHideDisclaimer: false,
    showBuiltWith: false,
    includeEditLink: true
  };

  var BLANK = {
    design: 'classic',
    accentColor: '#2563eb',
    logoPosition: 'center',
    direction: 'ltr',
    autoSize: true,
    filename: '',
    invoiceHeading: 'Invoice',
    invoiceDescription: '',
    invoiceFrom: { 'Issued By': '' },
    invoiceTo: [{ 'Bill To': '' }],
    metaTop: { 'Invoice Number': 'INV-0001', 'Invoice Date': '', 'Due Date': '' },
    metaBottom: {},
    columns: ['Description', 'Quantity', 'Rate', 'Amount'],
    lineItems: [{ Description: '', Quantity: '', Rate: '', Amount: '' }],
    summary: [{ label: 'Total', value: '' }],
    footerText: {},
    amountsVerifiedHideDisclaimer: false,
    showBuiltWith: false,
    includeEditLink: true
  };

  /* ═══ Utilities ═══ */

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function setPath(obj, path, val) {
    var ks = path.split('.');
    var o = obj;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = val;
  }

  function darkenHex(hex, amount) {
    var c = String(hex || '#2563eb').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(c)) c = '2563eb';
    var r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
    var g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
    var b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);
    var h = function (n) { return ('0' + n.toString(16)).slice(-2); };
    return '#' + h(r) + h(g) + h(b);
  }

  function resolveFilename(inv) {
    var custom = (inv.filename || '').replace(/\.pdf$/i, '').trim();
    if (custom) return custom;
    var num = inv.metaTop && inv.metaTop['Invoice Number'];
    if (num) return 'invoice-' + num;
    var head = (inv.invoiceHeading || '').trim();
    if (head) return head.replace(/\s+/g, '-').toLowerCase();
    return 'invoice';
  }

  function displayKey(key) {
    return (!key || (key.charAt(0) === '@' && key.charAt(key.length - 1) === '@')) ? '' : String(key).replace(/@/g, '');
  }

  function withDefaults(data) {
    var out = data && typeof data === 'object' ? data : {};
    Object.keys(DEFAULTS).forEach(function (k) {
      if (out[k] === undefined) out[k] = clone(DEFAULTS[k]);
    });
    return out;
  }

  /* ═══ Markdown-lite (SatoriMarkdown subset) ═══ */

  function inlineFmt(t) {
    return t
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/~~([^~]+)~~/g, '<s>$1</s>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function wrapSize(html, size) {
    return size ? '<span style="font-size:' + size + 'px">' + html + '</span>' : html;
  }

  function mdi(raw) {
    var src = String(raw == null ? '' : raw);
    var out = '', buf = '', sizes = [], i = 0;
    function flush() { if (buf) { out += wrapSize(inlineFmt(esc(buf)), sizes[sizes.length - 1]); buf = ''; } }
    while (i < src.length) {
      if (src.charAt(i) === '{' && src.charAt(i + 1) === '@') {
        var end = src.indexOf('}', i);
        if (end > -1) {
          var tok = src.slice(i + 2, end);
          flush();
          var m = tok.match(/^(\d+):([\s\S]*)$/);
          if (tok === 'p' || tok.indexOf('p:') === 0) sizes.pop();
          else if (/^\d+$/.test(tok)) sizes.push(parseInt(tok, 10));
          else if (m) out += wrapSize(inlineFmt(esc(m[2])), parseInt(m[1], 10));
          i = end + 1;
          continue;
        }
      }
      buf += src.charAt(i); i++;
    }
    flush();
    return out;
  }

  function md(raw) {
    var lines = String(raw == null ? '' : raw).split('\n');
    var html = '', i = 0;
    while (i < lines.length) {
      var L = lines[i];
      var hm = L.match(/^(#{1,7})\s+(.*)$/);
      if (hm) { html += '<div class="mdh mdh' + hm[1].length + '">' + mdi(hm[2]) + '</div>'; i++; continue; }
      if (/^\s*[-•]\s+/.test(L)) {
        var ul = [];
        while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) { ul.push(lines[i].replace(/^\s*[-•]\s+/, '')); i++; }
        html += '<ul class="mdul">' + ul.map(function (x) { return '<li>' + mdi(x) + '</li>'; }).join('') + '</ul>';
        continue;
      }
      if (/^\s*\d+\.\s+/.test(L)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
        html += '<ol class="mdol">' + ol.map(function (x) { return '<li>' + mdi(x) + '</li>'; }).join('') + '</ol>';
        continue;
      }
      if (/^\s*>\s?/.test(L)) {
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        html += '<blockquote class="mdq">' + q.map(mdi).join('<br>') + '</blockquote>';
        continue;
      }
      if (L.trim() === '') { html += '<div class="mdsp"></div>'; i++; continue; }
      html += '<div class="mdp">' + mdi(L) + '</div>';
      i++;
    }
    return html;
  }

  function cellMd(v) { return mdi(v == null ? '' : String(v)).replace(/\n/g, '<br>'); }

  /* ═══ Validation (zod rules mirrored) ═══ */

  function validate(s) {
    var errs = [];
    var HEX = /^#[0-9a-fA-F]{6}$/;
    function reqStr(path, v) { if (v !== undefined && String(v).trim() === '') errs.push({ path: path, message: 'This field is required' }); }
    function url(path, v) {
      if (v && !(String(v).indexOf('data:') === 0 || /^https?:\/\//.test(String(v))))
        errs.push({ path: path, message: 'Must be an http(s) URL or an uploaded image.' });
    }
    function posNum(path, v) { if (v !== undefined && !(typeof v === 'number' && v > 0)) errs.push({ path: path, message: 'Must be a positive number' }); }

    if (['classic', 'bold'].indexOf(s.design) === -1) errs.push({ path: 'design', message: 'Invalid option' });
    if (s.accentColor !== undefined && !HEX.test(s.accentColor)) errs.push({ path: 'accentColor', message: 'Must be a hex color like #2563eb' });
    if (['center', 'left', 'right'].indexOf(s.logoPosition) === -1) errs.push({ path: 'logoPosition', message: 'Invalid option' });
    if (['ltr', 'rtl'].indexOf(s.direction) === -1) errs.push({ path: 'direction', message: 'Invalid option' });

    reqStr('invoiceHeading', s.invoiceHeading);
    reqStr('invoiceDescription', s.invoiceDescription);
    reqStr('cancelledNotes', s.cancelledNotes);
    reqStr('footerText.topText', s.footerText && s.footerText.topText);
    reqStr('footerText.bottomText', s.footerText && s.footerText.bottomText);

    var cols = s.columns || [];
    if (!cols.length) errs.push({ path: 'columns', message: 'At least one column is required' });

    var items = s.lineItems || [];
    if (!items.length) errs.push({ path: 'lineItems', message: 'At least one line item is required' });
    var colSet = {};
    cols.forEach(function (c) { colSet[c] = true; });
    items.forEach(function (item, i) {
      var bad = Object.keys(item || {}).filter(function (k) { return !colSet[k]; });
      if (bad.length) errs.push({ path: 'lineItems.' + i, message: 'Line item ' + (i + 1) + ' contains invalid keys: ' + bad.join(', ') + ". These keys are not defined in the 'columns' array." });
    });

    var sum = s.summary || [];
    if (!sum.length) errs.push({ path: 'summary', message: 'At least one summary item is required' });
    sum.forEach(function (r, i) {
      if (r.label === undefined || String(r.label).trim() === '') errs.push({ path: 'summary.' + i + '.label', message: 'Summary label is required' });
      if (r.value === undefined || r.value === '') errs.push({ path: 'summary.' + i + '.value', message: 'Summary value is required' });
    });

    url('logoUrl', s.logoUrl);
    url('digitalSignatureUrl', s.digitalSignatureUrl);
    if (s.logoSize) { posNum('logoSize.width', s.logoSize.width); posNum('logoSize.height', s.logoSize.height); }
    if (s.signatureSize) { posNum('signatureSize.width', s.signatureSize.width); posNum('signatureSize.height', s.signatureSize.height); }

    return errs;
  }

  function validatePublic(data) {
    return validate(withDefaults(typeof data === 'string' ? JSON.parse(data) : data));
  }

  var TAB_OF = {
    heading: 'content', from: 'content', to: 'content', metaTop: 'content', columns: 'content',
    lineItems: 'content', summary: 'content', metaBottom: 'content', footer: 'content',
    invoiceHeading: 'content', invoiceDescription: 'content', invoiceFrom: 'content', invoiceTo: 'content',
    design: 'design', logo: 'design', signature: 'design',
    font: 'design', accentColor: 'design', logoPosition: 'design', direction: 'design',
    logoUrl: 'design', logoSize: 'design', digitalSignatureUrl: 'design', signatureSize: 'design',
    disclaimer: 'settings', cancelled: 'settings', filename: 'settings',
    autoSize: 'settings', amountsVerifiedHideDisclaimer: 'settings', isCancelled: 'settings',
    showBuiltWith: 'settings', includeEditLink: 'settings', cancelledNotes: 'settings'
  };

  /* ═══ Instance state (single mounted instance) ═══ */

  var state = clone(EXAMPLE);
  var errMap = {};
  var activeTab = 'form';
  var ui = null;
  var saveTimer = null;
  var storageOk = true;

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  };
  var DRAFT_KEY = 'ri_embed_draft_v1';

  /* ═══ Share hash (mirrors web/lib/share.ts) ═══ */

  function decodeShareHash(hash) {
    if (!hash) return null;
    var j = hash.match(/[#&]j=([^&]+)/);
    var raw = null;
    if (j) {
      try { raw = JSON.parse(decodeURIComponent(j[1])); } catch (e) { return null; }
    } else {
      var m = hash.match(/[#&]i=([^&]+)/);
      if (!m) return null;
      if (!window.LZString) return null;
      try {
        var json = window.LZString.decompressFromEncodedURIComponent(m[1]);
        if (!json) return null;
        raw = JSON.parse(json);
      } catch (e) { return null; }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    return withDefaults(raw);
  }

  function jsonShareHash(inv) {
    return '#j=' + encodeURIComponent(JSON.stringify(inv));
  }

  /* ═══ Tiny DOM helpers ═══ */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

  function q(sel) { return ui.root.querySelector(sel); }

  function section(title, desc, open, build) {
    var d = el('details', 'sec');
    if (open) d.open = true;
    var sum = el('summary');
    sum.appendChild(el('div', null, '<div class="sec-t">' + esc(title) + '</div>' + (desc ? '<div class="sec-d">' + esc(desc) + '</div>' : '')));
    sum.insertAdjacentHTML('beforeend', '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
    var body = el('div', 'sec-body');
    build(body);
    d.appendChild(sum);
    d.appendChild(body);
    return d;
  }

  function boundInput(path, attrs) {
    attrs = attrs || {};
    var inp = document.createElement(attrs.textarea ? 'textarea' : 'input');
    inp.className = 'inp' + (attrs.cls ? ' ' + attrs.cls : '');
    inp.setAttribute('data-bind', path);
    if (!attrs.textarea) inp.type = attrs.type || 'text';
    if (attrs.ph) inp.placeholder = attrs.ph;
    if (attrs.spell === false) inp.spellcheck = false;
    var v = getPath(state, path);
    inp.value = v == null ? '' : String(v);
    return inp;
  }

  function boundCheck(path, labelText) {
    var l = el('label', 'check');
    var c = document.createElement('input');
    c.type = 'checkbox';
    c.setAttribute('data-bind', path);
    c.checked = !!getPath(state, path);
    l.appendChild(c);
    l.appendChild(el('span', null, labelText));
    return l;
  }

  function errSlot(path) {
    var p = el('p', 'ferr');
    p.setAttribute('data-err', path);
    return p;
  }

  function moveBtn(dir, fn) {
    var b = el('button', 'obtn', dir === 'up' ? '▲' : '▼');
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function delBtn(fn, label) {
    var b = el('button', 'dbtn', ICON_TRASH + esc(label || ''));
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function addBtn(label, fn) {
    var b = el('button', 'pill', ICON_PLUS + esc(label));
    b.type = 'button';
    b.style.marginTop = '8px';
    b.addEventListener('click', fn);
    return b;
  }

  function emptyState(msg, cta, fn) {
    var d = el('div', null, '<p style="text-align:center;font-size:13px;color:#71717a;margin:0 0 12px">' + esc(msg) + '</p>');
    d.style.cssText = 'padding:24px;text-align:center;border:1px dashed #e4e4e7;border-radius:10px;background:#fafafa';
    var b = el('button', 'pill', ICON_PLUS + esc(cta));
    b.type = 'button';
    b.addEventListener('click', fn);
    d.appendChild(b);
    return d;
  }

  /* ═══ Section builders ═══ */

  function buildKVList(container, path, sectionId, label) {
    container.innerHTML = '';
    var obj = getPath(state, path) || {};
    var keys = Object.keys(obj);
    if (!keys.length) {
      container.appendChild(emptyState('No fields yet.', 'Add ' + label, function () {
        setPath(state, path, { '': '' });
        renderSection(sectionId);
        refresh();
      }));
      return;
    }
    keys.forEach(function (k, i) {
      var row = el('div', 'kvrow');
      var ord = el('div', 'ordbtns');
      ord.appendChild(moveBtn('up', function () { reorderKeys(path, sectionId, i, -1); }));
      ord.appendChild(moveBtn('dn', function () { reorderKeys(path, sectionId, i, 1); }));
      row.appendChild(ord);
      var grow = el('div', 'grow');
      var ki = document.createElement('input');
      ki.className = 'inp mb';
      ki.placeholder = 'Key (e.g. Email, Address)';
      ki.value = k;
      ki.addEventListener('input', function () { renameKey(path, i, ki.value); });
      var vi = document.createElement('input');
      vi.className = 'inp';
      vi.placeholder = 'Value';
      vi.value = obj[k] == null ? '' : String(obj[k]);
      vi.addEventListener('input', function () {
        var cur = getPath(state, path);
        cur[Object.keys(cur)[i]] = vi.value;
        refresh();
      });
      grow.appendChild(ki);
      grow.appendChild(vi);
      row.appendChild(grow);
      row.appendChild(delBtn(function () {
        var cur = getPath(state, path);
        delete cur[Object.keys(cur)[i]];
        renderSection(sectionId);
        refresh();
      }));
      container.appendChild(row);
    });
    container.appendChild(addBtn('Add ' + label, function () {
      var cur = getPath(state, path) || {};
      cur[''] = '';
      setPath(state, path, cur);
      renderSection(sectionId);
      refresh();
    }));
  }

  function reorderKeys(path, sectionId, i, dir) {
    var obj = getPath(state, path) || {};
    var keys = Object.keys(obj);
    var j = i + dir;
    if (j < 0 || j >= keys.length) return;
    var t = keys[i]; keys[i] = keys[j]; keys[j] = t;
    var out = {};
    keys.forEach(function (k) { out[k] = obj[k]; });
    setPath(state, path, out);
    renderSection(sectionId);
    refresh();
  }

  function renameKey(path, i, newKey) {
    var obj = getPath(state, path) || {};
    var keys = Object.keys(obj);
    var out = {};
    keys.forEach(function (k, idx) { out[idx === i ? newKey : k] = obj[k]; });
    setPath(state, path, out);
    refresh();
  }

  function buildHeading(c) {
    c.appendChild(boundInput('invoiceHeading', { ph: 'e.g., Invoice', cls: 'mb' }));
    c.appendChild(boundInput('invoiceDescription', { ph: 'e.g., Consulting services, September 2024' }));
  }

  function buildFrom(c) { buildKVList(c, 'invoiceFrom', 'from', 'field'); }

  function buildMetaTop(c) {
    var b = el('button', 'pill blue', 'Auto-fill next invoice number');
    b.type = 'button';
    b.style.marginBottom = '12px';
    b.addEventListener('click', function () {
      var cur = state.metaTop || {};
      var n = String(cur['Invoice Number'] || '');
      var m = n.match(/^(.*?)(\d+)\s*$/);
      var next;
      if (m) {
        var width = m[2].length;
        var inc = String(parseInt(m[2], 10) + 1);
        while (inc.length < width) inc = '0' + inc;
        next = m[1] + inc;
      } else {
        next = 'INV-0001';
      }
      var out = { 'Invoice Number': next };
      Object.keys(cur).forEach(function (k) { if (k !== 'Invoice Number') out[k] = cur[k]; });
      state.metaTop = out;
      renderSection('metaTop');
      refresh();
    });
    c.appendChild(b);
    var slot = el('div');
    c.appendChild(slot);
    buildKVList(slot, 'metaTop', 'metaTop', 'field');
  }

  function buildMetaBottom(c) { buildKVList(c, 'metaBottom', 'metaBottom', 'field'); }

  function buildSubKV(container, basePath) {
    container.innerHTML = '';
    var rec = getPath(state, basePath) || {};
    var keys = Object.keys(rec);
    keys.forEach(function (k, i) {
      var row = el('div', 'kvrow');
      var ord = el('div', 'ordbtns');
      ord.appendChild(moveBtn('up', function () { moveRecKey(basePath, i, -1); }));
      ord.appendChild(moveBtn('dn', function () { moveRecKey(basePath, i, 1); }));
      row.appendChild(ord);
      var grow = el('div', 'grow');
      var ki = document.createElement('input');
      ki.className = 'inp mb';
      ki.placeholder = 'Key';
      ki.value = k;
      ki.addEventListener('input', function () {
        var r = getPath(state, basePath);
        var ks = Object.keys(r);
        var out = {};
        ks.forEach(function (kk, idx) { out[idx === i ? ki.value : kk] = r[kk]; });
        setPath(state, basePath, out);
        refresh();
      });
      var vi = document.createElement('input');
      vi.className = 'inp';
      vi.placeholder = 'Value';
      vi.value = rec[k] == null ? '' : String(rec[k]);
      vi.addEventListener('input', function () {
        var r = getPath(state, basePath);
        r[Object.keys(r)[i]] = vi.value;
        refresh();
      });
      grow.appendChild(ki);
      grow.appendChild(vi);
      row.appendChild(grow);
      row.appendChild(delBtn(function () {
        var r = getPath(state, basePath);
        delete r[Object.keys(r)[i]];
        rerenderRecipient(basePath);
        refresh();
      }));
      container.appendChild(row);
    });
    container.appendChild(addBtn('Add field', function () {
      var r = getPath(state, basePath);
      r[''] = '';
      rerenderRecipient(basePath);
      refresh();
    }));
  }

  function moveRecKey(basePath, i, dir) {
    var r = getPath(state, basePath);
    var ks = Object.keys(r);
    var j = i + dir;
    if (j < 0 || j >= ks.length) return;
    var t = ks[i]; ks[i] = ks[j]; ks[j] = t;
    var out = {};
    ks.forEach(function (kk) { out[kk] = r[kk]; });
    setPath(state, basePath, out);
    rerenderRecipient(basePath);
    refresh();
  }

  function rerenderRecipient(basePath) {
    var idx = parseInt(basePath.split('.')[1], 10);
    var slots = ui.root.querySelectorAll('[data-subkv]');
    if (slots[idx]) buildSubKV(slots[idx], basePath);
  }

  function setColumns(next, skipRender) {
    var prev = state.columns || [];
    var items = (state.lineItems || []).map(function (item) {
      var out = {};
      next.forEach(function (cname, i) {
        var prevKey = prev[i];
        var v = (prevKey && prevKey in item ? item[prevKey] : item[cname]);
        out[cname] = v === undefined ? '' : v;
      });
      return out;
    });
    state.columns = next;
    state.lineItems = items;
    if (!skipRender) { renderSection('columns'); renderSection('lineItems'); }
    refresh();
  }

  function moveColumn(i, dir) {
    var next = state.columns.slice();
    var j = i + dir;
    if (j < 0 || j >= next.length) return;
    var t = next[i]; next[i] = next[j]; next[j] = t;
    setColumns(next);
  }

  function buildColumns(c) {
    var cols = state.columns || [];
    if (!cols.length) {
      c.appendChild(emptyState('No columns yet.', 'Use default columns', function () {
        setColumns(['Description', 'Quantity', 'Price', 'Amount']);
      }));
      return;
    }
    cols.forEach(function (col, i) {
      var row = el('div', 'kvrow');
      row.style.padding = '8px 10px';
      var ord = el('div', 'ordbtns');
      ord.appendChild(moveBtn('up', function () { moveColumn(i, -1); }));
      ord.appendChild(moveBtn('dn', function () { moveColumn(i, 1); }));
      row.appendChild(ord);
      var inp = document.createElement('input');
      inp.className = 'inp';
      inp.style.flex = '1';
      inp.placeholder = 'Column name';
      inp.value = col;
      inp.setAttribute('data-err-target', 'columns.' + i);
      inp.addEventListener('input', function () {
        var next = state.columns.slice();
        next[i] = inp.value;
        setColumns(next, true);
      });
      row.appendChild(inp);
      row.appendChild(delBtn(function () {
        setColumns(state.columns.filter(function (_, idx) { return idx !== i; }));
      }));
      c.appendChild(row);
    });
    c.appendChild(errSlot('columns'));
    c.appendChild(addBtn('Add Column', function () {
      setColumns((state.columns || []).concat(['']));
    }));
  }

  function buildLineItems(c) {
    var items = state.lineItems || [];
    if (!items.length) {
      c.appendChild(emptyState('No line items yet.', 'Add Line Item', function () {
        var rowObj = {};
        (state.columns || []).forEach(function (col) { rowObj[col] = ''; });
        state.lineItems = [rowObj];
        renderSection('lineItems');
        refresh();
      }));
      return;
    }
    items.forEach(function (item, ri) {
      var row = el('div', 'kvrow');
      var ord = el('div', 'ordbtns');
      ord.appendChild(moveBtn('up', function () {
        if (ri - 1 < 0) return;
        var arr = state.lineItems.slice();
        var t = arr[ri]; arr[ri] = arr[ri - 1]; arr[ri - 1] = t;
        state.lineItems = arr;
        renderSection('lineItems');
        refresh();
      }));
      ord.appendChild(moveBtn('dn', function () {
        var arr = state.lineItems.slice();
        if (ri + 1 >= arr.length) return;
        var t = arr[ri]; arr[ri] = arr[ri + 1]; arr[ri + 1] = t;
        state.lineItems = arr;
        renderSection('lineItems');
        refresh();
      }));
      row.appendChild(ord);
      var grow = el('div', 'grow');
      (state.columns || []).forEach(function (col, ci) {
        var inp = document.createElement('input');
        inp.className = 'inp' + (ci < (state.columns || []).length - 1 ? ' mb' : '');
        inp.placeholder = col || ('Column ' + (ci + 1));
        inp.value = item[col] == null ? '' : String(item[col]);
        inp.addEventListener('input', function () {
          state.lineItems[ri][col] = inp.value;
          refresh();
        });
        grow.appendChild(inp);
      });
      row.appendChild(grow);
      row.appendChild(delBtn(function () {
        state.lineItems.splice(ri, 1);
        renderSection('lineItems');
        refresh();
      }));
      c.appendChild(row);
    });
    c.appendChild(errSlot('lineItems'));
    c.appendChild(addBtn('Add Line Item', function () {
      var rowObj = {};
      (state.columns || []).forEach(function (col) { rowObj[col] = ''; });
      state.lineItems = (state.lineItems || []).concat([rowObj]);
      renderSection('lineItems');
      refresh();
    }));
  }

  function buildSummary(c) {
    var rows = state.summary || [];
    if (!rows.length) {
      c.appendChild(emptyState('No summary rows yet.', 'Add Summary Row', function () {
        state.summary = [{ label: '', value: '' }];
        renderSection('summary');
        refresh();
      }));
      return;
    }
    rows.forEach(function (s, i) {
      var row = el('div', 'kvrow');
      var ord = el('div', 'ordbtns');
      ord.appendChild(moveBtn('up', function () {
        if (i - 1 < 0) return;
        var arr = state.summary.slice();
        var t = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = t;
        state.summary = arr;
        renderSection('summary');
        refresh();
      }));
      ord.appendChild(moveBtn('dn', function () {
        var arr = state.summary.slice();
        if (i + 1 >= arr.length) return;
        var t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
        state.summary = arr;
        renderSection('summary');
        refresh();
      }));
      row.appendChild(ord);
      var grow = el('div', 'grow');
      var li = document.createElement('input');
      li.className = 'inp mb';
      li.placeholder = 'Label (e.g., Subtotal)';
      li.value = s.label || '';
      li.setAttribute('data-err-target', 'summary.' + i + '.label');
      li.addEventListener('input', function () { state.summary[i].label = li.value; refresh(); });
      var vi = document.createElement('input');
      vi.className = 'inp';
      vi.placeholder = 'Value (e.g., $1,200)';
      vi.value = s.value == null ? '' : String(s.value);
      vi.setAttribute('data-err-target', 'summary.' + i + '.value');
      vi.addEventListener('input', function () { state.summary[i].value = vi.value; refresh(); });
      grow.appendChild(li);
      grow.appendChild(errSlot('summary.' + i + '.label'));
      grow.appendChild(vi);
      grow.appendChild(errSlot('summary.' + i + '.value'));
      row.appendChild(grow);
      row.appendChild(delBtn(function () {
        state.summary.splice(i, 1);
        renderSection('summary');
        refresh();
      }));
      c.appendChild(row);
    });
    c.appendChild(errSlot('summary'));
    c.appendChild(addBtn('Add Summary Row', function () {
      state.summary = (state.summary || []).concat([{ label: '', value: '' }]);
      renderSection('summary');
      refresh();
    }));
  }

  function buildFooter(c) {
    c.appendChild(boundInput('footerText.topText', { ph: 'Top text (e.g., Thank you!)', cls: 'mb' }));
    c.appendChild(boundInput('footerText.bottomText', { ph: 'Bottom text' }));
  }

  function segControl(options, current, labels, onPick) {
    var seg = el('div', 'seg');
    options.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = labels ? labels[i] : opt;
      if (opt === current) b.classList.add('on');
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        onPick(opt);
      });
      seg.appendChild(b);
    });
    return seg;
  }

  function buildDesign(c) {
    var variantWrap = el('div');
    variantWrap.style.marginBottom = '16px';
    variantWrap.appendChild(el('label', 'lbl', 'Variant'));
    var vg = el('div', 'variant');
    [['classic', 'Boxed · flexible'], ['bold', 'Accent · striking']].forEach(function (pair) {
      var b = el('button', 'vbtn' + ((state.design || 'classic') === pair[0] ? ' on' : ''), '<b>' + pair[0] + '</b><i>' + pair[1] + '</i>');
      b.type = 'button';
      b.addEventListener('click', function () {
        state.design = pair[0];
        vg.querySelectorAll('.vbtn').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        refresh();
      });
      vg.appendChild(b);
    });
    variantWrap.appendChild(vg);
    c.appendChild(variantWrap);

    var fontWrap = el('div');
    fontWrap.style.marginBottom = '16px';
    fontWrap.appendChild(el('label', 'lbl', 'Typeface'));
    fontWrap.appendChild(el('p', 'hint', 'Embedded in PDF as Regular + Bold. Default Inter.'));
    var chips = el('div', 'chips');
    var curFont = state.font || 'Inter';
    FONTS.forEach(function (f) {
      var ch = el('button', 'chip' + (f === curFont ? ' on' : ''), esc(f));
      ch.type = 'button';
      ch.style.fontFamily = '"' + f + '", ui-sans-serif, system-ui, sans-serif';
      ch.addEventListener('click', function () {
        state.font = f;
        chips.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); });
        ch.classList.add('on');
        refresh();
      });
      chips.appendChild(ch);
    });
    fontWrap.appendChild(chips);
    c.appendChild(fontWrap);

    var accWrap = el('div');
    accWrap.style.marginBottom = '16px';
    accWrap.appendChild(el('label', 'lbl', 'Accent color'));
    var crow = el('div', 'colorrow');
    var pick = document.createElement('input');
    pick.type = 'color';
    pick.value = /^#[0-9a-fA-F]{6}$/.test(state.accentColor || '') ? state.accentColor : '#2563eb';
    var txt = boundInput('accentColor', {});
    txt.style.fontFamily = 'ui-monospace, Menlo, monospace';
    txt.style.width = '130px';
    pick.addEventListener('input', function () {
      state.accentColor = pick.value;
      txt.value = pick.value;
      refresh();
    });
    txt.addEventListener('input', function () {
      if (/^#[0-9a-fA-F]{6}$/.test(txt.value)) pick.value = txt.value;
    });
    crow.appendChild(pick);
    crow.appendChild(txt);
    accWrap.appendChild(crow);
    var sws = el('div', 'swatches');
    ['#2563eb', '#111827', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d'].forEach(function (cl) {
      var s = el('button', 'sw');
      s.type = 'button';
      s.style.background = cl;
      s.title = cl;
      s.setAttribute('aria-label', 'Use ' + cl);
      s.addEventListener('click', function () {
        state.accentColor = cl;
        pick.value = cl;
        txt.value = cl;
        refresh();
      });
      sws.appendChild(s);
    });
    accWrap.appendChild(sws);
    c.appendChild(accWrap);

    var dirWrap = el('div');
    dirWrap.style.marginBottom = '16px';
    dirWrap.appendChild(el('label', 'lbl', 'Reading direction'));
    dirWrap.appendChild(segControl(['ltr', 'rtl'], state.direction || 'ltr', ['LTR · Left-to-right', 'RTL · Right-to-left'], function (d) {
      state.direction = d;
      refresh();
    }));
    c.appendChild(dirWrap);

    var lpWrap = el('div');
    lpWrap.appendChild(el('label', 'lbl', 'Logo position'));
    lpWrap.appendChild(segControl(['left', 'center', 'right'], state.logoPosition || 'center', null, function (p) {
      state.logoPosition = p;
      refresh();
    }));
    if (!state.logoUrl) lpWrap.appendChild(el('p', 'hint', 'Add a logo below to enable positioning.'));
    c.appendChild(lpWrap);
  }

  function imagePicker(labelTxt, urlPath, sizePath, maxW, maxH) {
    var wrap = el('div');
    wrap.appendChild(el('label', 'lbl', esc(labelTxt)));
    wrap.appendChild(boundInput(urlPath, { ph: 'Paste an image URL or pick a file', cls: 'mb', spell: false }));
    var row = el('div');
    row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    var szw = el('div', 'imgsize');
    szw.appendChild(boundInput(sizePath + '.width', { type: 'number', ph: 'Width' }));
    szw.appendChild(boundInput(sizePath + '.height', { type: 'number', ph: 'Height' }));
    row.appendChild(szw);
    var up = el('button', 'pill', 'Upload file');
    up.type = 'button';
    up.addEventListener('click', function () {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          var img = new Image();
          img.onload = function () {
            var w = img.naturalWidth, h = img.naturalHeight;
            var sc = Math.min(1, maxW / w, maxH / h);
            w = Math.max(1, Math.round(w * sc));
            h = Math.max(1, Math.round(h * sc));
            var cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(img, 0, 0, w, h);
            setPath(state, urlPath, cv.toDataURL('image/png'));
            setPath(state, sizePath, { width: w, height: h });
            renderSection(urlPath === 'logoUrl' ? 'logo' : 'signature');
            refresh();
          };
          img.src = r.result;
        };
        r.readAsDataURL(f);
      };
      inp.click();
    });
    row.appendChild(up);
    row.appendChild(delBtn(function () {
      setPath(state, urlPath, '');
      renderSection(urlPath === 'logoUrl' ? 'logo' : 'signature');
      refresh();
    }, 'Remove'));
    wrap.appendChild(row);
    wrap.appendChild(errSlot(urlPath));
    return wrap;
  }

  function buildLogo(c) { c.appendChild(imagePicker('Logo', 'logoUrl', 'logoSize', 600, 200)); }
  function buildSignature(c) { c.appendChild(imagePicker('Signature', 'digitalSignatureUrl', 'signatureSize', 500, 160)); }

  function buildOptions(c) {
    c.appendChild(boundCheck('autoSize', 'Auto-size PDF to content (vs A4)'));
    c.appendChild(boundCheck('amountsVerifiedHideDisclaimer', 'I have verified the invoice, and want to hide disclaimer.'));
    var canc = boundCheck('isCancelled', 'Mark as cancelled');
    canc.querySelector('input').addEventListener('change', function () {
      var sec = q('[data-section="cancelled"]');
      if (sec) sec.style.display = state.isCancelled ? '' : 'none';
    });
    c.appendChild(canc);
    c.appendChild(boundCheck('showBuiltWith', 'Show "Built with RenderInvoice" at the bottom'));
    c.appendChild(boundCheck('includeEditLink', 'PDF edit link'));
  }

  function buildFilename(c) {
    c.appendChild(boundInput('filename', { ph: 'e.g., invoice-september' }));
  }

  function buildCancelled(c) {
    c.appendChild(boundInput('cancelledNotes', { textarea: true }));
    var t = c.querySelector('textarea');
    t.rows = 3;
  }

  var SECTIONS = [
    { id: 'heading', tab: 'content', title: 'Heading', desc: 'Title plus subtitle. Subtitle accepts markdown: **bold** *italic* ~~strike~~ `code` [label](url) # heading - list.', open: true, build: buildHeading },
    { id: 'from', tab: 'content', title: 'Invoice From', desc: 'Sender details. Use arrows to reorder. Values accept **bold** *italic* ~~strike~~ `code` [label](url).', open: true, build: buildFrom },
    { id: 'to', tab: 'content', title: 'Invoice To', desc: 'One block per recipient. Values accept markdown.', open: true, build: null },
    { id: 'metaTop', tab: 'content', title: 'Meta (Top)', desc: 'Invoice number, date, and due date shown above line items.', open: true, build: buildMetaTop },
    { id: 'columns', tab: 'content', title: 'Columns', desc: 'Column headers for the line items table. Renaming a column keeps cell values.', open: true, build: buildColumns },
    { id: 'lineItems', tab: 'content', title: 'Line Items', desc: 'Each row is one item. Cell text accepts markdown.', open: true, build: buildLineItems },
    { id: 'summary', tab: 'content', title: 'Summary', desc: 'Subtotal, tax, discounts, and total rows.', open: true, build: buildSummary },
    { id: 'metaBottom', tab: 'content', title: 'Meta (Bottom)', desc: 'Payment terms and notes shown below line items.', open: false, build: buildMetaBottom },
    { id: 'footer', tab: 'content', title: 'Footer', desc: 'Markdown: **bold** *italic* headings {@18} lists. Line breaks kept.', open: false, build: buildFooter },
    { id: 'design', tab: 'design', title: 'Design', desc: 'Pick a visual variant, accent color, and reading direction.', open: true, build: buildDesign },
    { id: 'logo', tab: 'design', title: 'Logo', desc: 'Paste an image URL or upload a file. Files are resized and embedded locally.', open: false, build: buildLogo },
    { id: 'signature', tab: 'design', title: 'Digital Signature', desc: 'Paste a URL or upload an image of your signature.', open: false, build: buildSignature },
    { id: 'disclaimer', tab: 'settings', title: 'Options', desc: '', open: true, build: buildOptions },
    { id: 'filename', tab: 'settings', title: 'Filename', desc: 'What the downloaded PDF will be called.', open: false, build: buildFilename },
    { id: 'cancelled', tab: 'settings', title: 'Cancellation Notes', desc: 'Same markdown as the description.', open: true, build: buildCancelled }
  ];

  function renderSection(id) {
    var def = null;
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) def = SECTIONS[i];
    if (!def) return;
    var host = q('#form-tab-' + def.tab);
    var node = section(def.title, def.desc, def.open, def.build || function () {});
    node.setAttribute('data-section', id);

    if (id === 'to') {
      var inner = node.querySelector('.sec-body');
      inner.innerHTML = '';
      var slot = el('div');
      inner.appendChild(slot);
      var recips = state.invoiceTo || [];
      if (!recips.length) {
        slot.appendChild(emptyState('No recipients yet.', 'Add Recipient', function () {
          state.invoiceTo = [{ 'Bill To': '' }];
          renderSection('to');
          refresh();
        }));
      } else {
        recips.forEach(function (rec, ri) {
          var box = el('div', 'recip');
          var sub = el('div');
          sub.setAttribute('data-subkv', '');
          box.appendChild(sub);
          buildSubKV(sub, 'invoiceTo.' + ri);
          box.appendChild(delBtn(function () {
            state.invoiceTo.splice(ri, 1);
            renderSection('to');
            refresh();
          }, 'Delete Recipient'));
          slot.appendChild(box);
        });
        slot.appendChild(addBtn('Add Recipient', function () {
          state.invoiceTo.push({ '': '' });
          renderSection('to');
          refresh();
        }));
      }
    }

    if (id === 'cancelled') node.style.display = state.isCancelled ? '' : 'none';

    var existing = host.querySelector('[data-section="' + id + '"]');
    if (existing) host.replaceChild(node, existing);
    else host.appendChild(node);
  }

  function buildForm() {
    q('#form-tab-content').innerHTML = '';
    q('#form-tab-design').innerHTML = '';
    q('#form-tab-settings').innerHTML = '';
    SECTIONS.forEach(function (s) { renderSection(s.id); });
  }

  /* ═══ Invoice templates (mirror ClassicTemplate / BoldTemplate) ═══ */

  function copyrightOf(inv) {
    var from = inv.invoiceFrom || {};
    var name = '';
    var keys = ['Issued By', 'Company', 'Legal Name', 'Name', 'Raised By'];
    for (var i = 0; i < keys.length; i++) {
      if (from[keys[i]]) { name = String(from[keys[i]]).replace(/<[^>]*>/g, ''); break; }
    }
    if (!name) {
      var vs = Object.keys(from).map(function (k) { return from[k]; });
      if (vs.length) name = String(vs[0]).replace(/<[^>]*>/g, '');
    }
    var ds = (inv.metaTop && (inv.metaTop['Invoice Date'] || inv.metaTop['Date'] || inv.metaTop['Tax Point'])) || '';
    var y = ds ? new Date(ds).getFullYear() : NaN;
    if (!isFinite(y)) y = new Date().getFullYear();
    return name ? '© ' + y + ' ' + name + '. All rights reserved.' : '© ' + y + '. All rights reserved.';
  }

  function columnFlex(colName) {
    return /description|item|details|notes|service|task|line\s*item/i.test(colName) ? 2.5 : 1;
  }

  function disclaimerHtml() {
    return '<div class="disc">' +
      '<div class="disc-h"><span class="disc-bang">!</span><span class="disc-t">Notice</span></div>' +
      '<div class="disc-x">RenderInvoice.com does not verify totals, calculations, or tax rates. Please check all line items and legal requirements before sending. To hide this message, check the verification box under Options in the editor.</div>' +
      '</div>';
  }

  function fldHtml(k, v) {
    var lbl = displayKey(k);
    var lh = lbl ? '<span class="fl">' + mdi(lbl) + ':</span> ' : '';
    return '<div class="fld">' + lh + mdi(v) + '</div>';
  }

  function imgHtml(url, size, fbW, fbH) {
    if (!url) return '';
    var w = size && size.width ? size.width : fbW;
    var h = size && size.height ? size.height : fbH;
    return '<img src="' + esc(url) + '" alt="" width="' + w + '" height="' + h + '">';
  }

  function classicTpl(inv) {
    var cols = inv.columns || [];
    var logoPos = inv.logoUrl ? (inv.logoPosition || 'center') : 'left';
    var h = '';

    if (inv.isCancelled || inv.cancelledNotes) {
      h += '<div class="cancelbadge">' + cellMd(inv.cancelledNotes || 'Cancelled') + '</div>';
    }

    h += '<div class="headblock ' + logoPos + ' px">';
    if (inv.logoUrl) h += '<div>' + imgHtml(inv.logoUrl, inv.logoSize, 120, 40) + '</div>';
    if (inv.invoiceHeading) h += '<h1 class="phead">' + md(inv.invoiceHeading) + '</h1>';
    if (inv.invoiceDescription) h += '<div class="pdesc">' + md(inv.invoiceDescription) + '</div>';
    h += '</div>';

    if (!inv.amountsVerifiedHideDisclaimer) h += '<div class="px">' + disclaimerHtml() + '</div>';

    h += '<div class="parties px"><div class="pcard">';
    Object.keys(inv.invoiceFrom || {}).forEach(function (k) { h += fldHtml(k, inv.invoiceFrom[k]); });
    h += '</div>';
    (inv.invoiceTo || []).forEach(function (rec) {
      h += '<div class="pcard">';
      Object.keys(rec || {}).forEach(function (k) { h += fldHtml(k, rec[k]); });
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="metarow px">';
    Object.keys(inv.metaTop || {}).forEach(function (k) {
      h += '<div class="mi"><div class="mi-k">' + cellMd(k + ':') + '</div><div class="mi-v">' + cellMd(inv.metaTop[k]) + '</div></div>';
    });
    h += '</div>';

    h += '<div class="tbl"><div class="th">';
    cols.forEach(function (c, i) {
      h += '<div class="thc' + (i === cols.length - 1 ? ' r' : '') + '" style="flex:' + columnFlex(c) + '">' + cellMd(c) + '</div>';
    });
    h += '</div>';
    (inv.lineItems || []).forEach(function (item) {
      h += '<div class="tr">';
      cols.forEach(function (c, i) {
        h += '<div class="tc' + (i === cols.length - 1 ? ' r' : '') + '" style="flex:' + columnFlex(c) + '">' + (item[c] != null ? cellMd(item[c]) : '') + '</div>';
      });
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="sumwrap px"><div class="sum">';
    (inv.summary || []).forEach(function (s, i) {
      var last = i === (inv.summary || []).length - 1;
      h += '<div class="srow' + (last ? ' last' : '') + '">' +
        '<span class="sl' + (last ? ' last' : '') + '">' + cellMd(s.label) + '</span>' +
        '<span class="sv' + (last ? ' last' : '') + '">' + cellMd(s.value) + '</span></div>';
    });
    h += '</div></div>';

    if (inv.metaBottom && Object.keys(inv.metaBottom).length) {
      h += '<div class="metarow px">';
      Object.keys(inv.metaBottom).forEach(function (k) {
        h += '<div class="mi"><div class="mi-k">' + cellMd(k + ':') + '</div><div class="mi-v">' + cellMd(inv.metaBottom[k]) + '</div></div>';
      });
      h += '</div>';
    }

    if (inv.digitalSignatureUrl) h += '<div class="sig">' + imgHtml(inv.digitalSignatureUrl, inv.signatureSize, 160, 40) + '</div>';

    if (inv.footerText && (inv.footerText.topText || inv.footerText.bottomText)) {
      h += '<div class="foot px">';
      if (inv.footerText.topText) h += '<div class="ft">' + md(inv.footerText.topText) + '</div>';
      if (inv.footerText.bottomText) h += '<div class="fb">' + md(inv.footerText.bottomText) + '</div>';
      h += '</div>';
    }

    if (inv.invoiceFrom && inv.invoiceFrom.Email) {
      h += '<div class="email px">' + cellMd(inv.invoiceFrom.Email) + '</div>';
    }

    if (inv.cancelledNotes) h += '<div class="cnote">' + md(inv.cancelledNotes) + '</div>';

    h += '<div class="copy px">' + esc(copyrightOf(inv)) + '</div>';

    if (inv.showBuiltWith) h += '<div class="builtwith px">Built with RenderInvoice · un-opinionated invoice generator</div>';

    if (!inv.amountsVerifiedHideDisclaimer) h += '<div class="px">' + disclaimerHtml() + '</div>';

    return '<div class="inv">' + h + '</div>';
  }

  function boldParty(entries) {
    if (!entries.length) return '';
    var h = '<div class="bp">';
    h += '<div class="bp-k">' + cellMd(entries[0][0]) + '</div>';
    h += '<div class="bp-v">' + cellMd(entries[0][1]) + '</div>';
    entries.slice(1).forEach(function (e) { h += fldHtml(e[0], e[1]); });
    h += '</div>';
    return h;
  }

  function boldTpl(inv) {
    var accent = inv.accentColor || '#2563eb';
    var darker = darkenHex(accent, 40);
    var cols = inv.columns || [];
    var logoPos = inv.logoPosition || 'center';
    var invNum = (inv.metaTop && (inv.metaTop['Invoice Number'] || inv.metaTop['Number'])) || '';
    var h = '';

    if (inv.isCancelled || inv.cancelledNotes) {
      h += '<div class="cancelbadge">' + cellMd(inv.cancelledNotes || 'Cancelled') + '</div>';
    }

    h += '<div class="bhead" style="--accent-dark:' + darker + '">';
    h += '<div class="bhead-row' + (logoPos === 'right' ? ' rev' : '') + '">';
    if (inv.logoUrl) h += '<div class="blogobox">' + imgHtml(inv.logoUrl, inv.logoSize, 108, 36) + '</div>';
    h += '<div class="bht' + (logoPos === 'right' ? ' right' : '') + '">';
    h += '<div class="beyebrow">' + cellMd(inv.invoiceHeading || 'Invoice') + '</div>';
    if (invNum) h += '<div class="bnum">' + cellMd(invNum) + '</div>';
    if (inv.invoiceDescription) h += '<div class="bdesc">' + md(inv.invoiceDescription) + '</div>';
    h += '</div></div></div>';

    if (!inv.amountsVerifiedHideDisclaimer) h += '<div class="px" style="padding-top:16px">' + disclaimerHtml() + '</div>';

    h += '<div class="parties px">';
    var fromEntries = Object.keys(inv.invoiceFrom || {}).map(function (k) { return [displayKey(k), String(inv.invoiceFrom[k])]; });
    h += '<div class="pcard">' + boldParty(fromEntries) + '</div>';
    h += '<div class="pcard" style="gap:16px">';
    (inv.invoiceTo || []).forEach(function (rec) {
      h += boldParty(Object.keys(rec || {}).map(function (k) { return [k, String(rec[k])]; }));
    });
    h += '</div></div>';

    if (inv.metaTop && Object.keys(inv.metaTop).length) {
      h += '<div class="metabox" style="background:' + accent + '14">';
      Object.keys(inv.metaTop).forEach(function (k) {
        h += '<div class="mi"><div class="mi-k">' + cellMd(k) + '</div><div class="mi-v">' + cellMd(inv.metaTop[k]) + '</div></div>';
      });
      h += '</div>';
    }

    h += '<div class="btbl"><div class="bth">';
    cols.forEach(function (c, i) {
      h += '<div class="thc' + (i === cols.length - 1 ? ' r' : '') + '" style="flex:' + columnFlex(c) + '">' + cellMd(c) + '</div>';
    });
    h += '</div>';
    (inv.lineItems || []).forEach(function (item, ri) {
      h += '<div class="btr' + (ri % 2 ? ' alt' : '') + '">';
      cols.forEach(function (c, i) {
        h += '<div class="tc' + (i === cols.length - 1 ? ' r' : '') + '" style="flex:' + columnFlex(c) + '">' + (item[c] != null ? cellMd(item[c]) : '') + '</div>';
      });
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="sumwrap px"><div class="bsum">';
    (inv.summary || []).forEach(function (s, i) {
      var last = i === (inv.summary || []).length - 1;
      h += '<div class="bsrow' + (last ? ' last' : (i % 2 ? ' alt' : '')) + '">' +
        '<span class="sl">' + cellMd(s.label) + '</span>' +
        '<span class="sv">' + cellMd(s.value) + '</span></div>';
    });
    h += '</div></div>';

    if (inv.metaBottom && Object.keys(inv.metaBottom).length) {
      h += '<div class="mbcards">';
      Object.keys(inv.metaBottom).forEach(function (k) {
        h += '<div class="mbcard"><div class="mi-k">' + cellMd(k) + '</div><div class="mi-v">' + cellMd(inv.metaBottom[k]) + '</div></div>';
      });
      h += '</div>';
    }

    if (inv.digitalSignatureUrl) {
      h += '<div class="sig" style="display:flex;flex-direction:column;padding-top:4px">' +
        '<div class="sig-l">Signed</div>' +
        imgHtml(inv.digitalSignatureUrl, inv.signatureSize, 180, 45) + '</div>';
    }

    if (inv.footerText && (inv.footerText.topText || inv.footerText.bottomText)) {
      h += '<div class="bfoot">';
      if (inv.footerText.topText) h += '<div class="ft">' + md(inv.footerText.topText) + '</div>';
      if (inv.footerText.bottomText) h += '<div class="fb">' + md(inv.footerText.bottomText) + '</div>';
      h += '</div>';
    }

    if (inv.cancelledNotes) h += '<div class="cnote">' + md(inv.cancelledNotes) + '</div>';

    h += '<div class="copy px">' + esc(copyrightOf(inv)) + '</div>';

    if (inv.showBuiltWith) h += '<div class="builtwith px">Built with RenderInvoice · un-opinionated invoice generator</div>';

    return '<div class="inv bold">' + h + '</div>';
  }

  function renderInvoiceHtml(inv) {
    var data = withDefaults(inv);
    var accent = data.accentColor || '#2563eb';
    var tpl = data.design === 'bold' ? boldTpl(data) : classicTpl(data);
    var strip = data.includeEditLink !== false ? '<div class="editstrip"></div>' : '';
    return '<style>' + INVOICE_CSS + '</style>' +
      '<div class="ri-inv" dir="' + (data.direction === 'rtl' ? 'rtl' : 'ltr') + '" style="--accent:' + esc(accent) + ';--accent-dark:' + darkenHex(accent, 40) + '">' +
      tpl + strip + '</div>';
  }

  var INVOICE_CSS = [
    '.ri-inv{--accent:#2563eb;--accent-dark:#1d4ed8;color:#111827;position:relative;width:900px;background:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.5}',
    '.ri-inv .inv{display:flex;flex-direction:column;gap:14px;padding:32px 0 24px;position:relative}',
    '.ri-inv .inv.bold{gap:16px;padding-top:0}',
    '.ri-inv .px{padding-left:48px;padding-right:48px}',
    '.ri-inv p{margin:0}.ri-inv a{color:inherit}',
    '.ri-inv .cancelbadge{position:absolute;top:0;right:0;background:#ef4444;color:#fff;padding:8px 16px;font-size:13px;font-weight:600;z-index:10}',
    '.ri-inv .headblock{display:flex;flex-direction:column;gap:8px}',
    '.ri-inv .headblock.center{align-items:center;text-align:center}',
    '.ri-inv .headblock.left{align-items:flex-start;text-align:left}',
    '.ri-inv .headblock.right{align-items:flex-end;text-align:right}',
    '.ri-inv h1.phead{margin:0;font-size:24px;font-weight:700;color:#1f2937;line-height:1.25}',
    '.ri-inv .pdesc{font-size:14px;color:#4b5563;line-height:1.5}',
    '.ri-inv .disc{margin-top:16px;margin-bottom:12px;padding:16px;border-radius:8px;background:rgba(254,252,232,.9);border:1px solid rgba(254,240,138,.5)}',
    '.ri-inv .disc-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
    '.ri-inv .disc-bang{width:18px;height:18px;background:#a16207;color:#fff;border-radius:4px;font-size:12px;font-weight:700;display:grid;place-items:center}',
    '.ri-inv .disc-t{font-size:13px;font-weight:600;color:#854d0e}',
    '.ri-inv .disc-x{font-size:12px;color:#a16207;line-height:1.5}',
    '.ri-inv .parties{display:flex;flex-wrap:wrap;gap:12px}',
    '.ri-inv .pcard{flex:1 1 220px;min-width:0;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:4px}',
    '.ri-inv .fld{font-size:13px;line-height:1.5;color:#111827;word-break:break-word}',
    '.ri-inv .fld .fl{font-weight:500}',
    '.ri-inv .bp{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.ri-inv .bp-k{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:4px;word-break:break-word}',
    '.ri-inv .bp-v{font-size:14px;font-weight:600;color:#18181b;word-break:break-word}',
    '.ri-inv .metarow{display:flex;flex-wrap:wrap;gap:16px}',
    '.ri-inv .mi{display:flex;flex-direction:column;gap:2px;min-width:120px}',
    '.ri-inv .mi-k{font-size:12px;color:#6b7280;font-weight:500}',
    '.ri-inv .mi-v{font-size:13px;color:#1f2937}',
    '.ri-inv .tbl{margin:0 48px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}',
    '.ri-inv .tr{display:flex;gap:8px;padding:10px 16px;border-bottom:1px solid #f3f4f6;align-items:stretch}',
    '.ri-inv .tr:last-child{border-bottom:0}',
    '.ri-inv .th{display:flex;gap:8px;padding:12px 16px;border-bottom:1px solid #e5e7eb}',
    '.ri-inv .tc{min-width:0;word-break:break-word;font-size:13px;color:#111827}',
    '.ri-inv .thc{min-width:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:var(--accent)}',
    '.ri-inv .r{text-align:right}',
    '.ri-inv .sumwrap{display:flex;justify-content:flex-end}',
    '.ri-inv .sum{width:320px;display:flex;flex-direction:column;gap:6px}',
    '.ri-inv .srow{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px solid #f3f4f6}',
    '.ri-inv .srow.last{border-top:2px solid var(--accent);margin-top:6px}',
    '.ri-inv .sl{font-size:13px;color:#6b7280}',
    '.ri-inv .sl.last{color:#111827;font-weight:700}',
    '.ri-inv .sv{font-size:13px;color:#111827;font-weight:500}',
    '.ri-inv .sv.last{font-size:16px;color:var(--accent);font-weight:700}',
    '.ri-inv .sig{padding:0 48px}',
    '.ri-inv .sig img,.ri-inv .headblock img,.ri-inv .blogobox img{object-fit:contain;max-width:100%}',
    '.ri-inv .foot{display:flex;flex-direction:column;gap:4px}',
    '.ri-inv .ft{font-size:16px;font-weight:600;color:#111827;line-height:1.4}',
    '.ri-inv .fb{font-size:13px;color:#6b7280;line-height:1.5}',
    '.ri-inv .email{font-size:13px;font-weight:500;color:#1f2937}',
    '.ri-inv .cnote{margin:0 48px;background:#ef4444;color:#fff;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:600}',
    '.ri-inv .copy{font-size:12px;color:#6b7280}',
    '.ri-inv .builtwith{font-size:10px;color:#9ca3af}',
    '.ri-inv .editstrip{height:22px;margin-top:4px;border-top:1px solid #a1a1aa;background:#fafafa}',
    '.ri-inv .inv.bold .bhead{padding:40px 48px;border-radius:8px 8px 0 0;background-image:linear-gradient(135deg,var(--accent),var(--accent-dark));color:#fff}',
    '.ri-inv .inv.bold .bhead-row{display:flex;align-items:flex-start;gap:24px}',
    '.ri-inv .inv.bold .bhead-row.rev{flex-direction:row-reverse}',
    '.ri-inv .inv.bold .blogobox{background:#fff;border-radius:6px;padding:8px}',
    '.ri-inv .inv.bold .bht{flex:1;min-width:0}',
    '.ri-inv .inv.bold .bht.right{text-align:right}',
    '.ri-inv .inv.bold .beyebrow{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:.8}',
    '.ri-inv .inv.bold .bnum{font-size:36px;font-weight:800;margin-top:4px;line-height:1.15}',
    '.ri-inv .inv.bold .bdesc{font-size:14px;opacity:.8;margin-top:8px;line-height:1.5}',
    '.ri-inv .inv.bold .parties{gap:16px}',
    '.ri-inv .inv.bold .pcard{border:0;padding:0;flex-basis:240px}',
    '.ri-inv .inv.bold .metabox{margin:0 48px;padding:16px;border-radius:8px;flex-wrap:wrap;display:flex;gap:16px}',
    '.ri-inv .inv.bold .metabox .mi-k{font-size:11px;color:#71717a;font-weight:600}',
    '.ri-inv .inv.bold .metabox .mi-v{font-weight:600;color:#18181b}',
    '.ri-inv .inv.bold .btbl{margin:0 48px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden}',
    '.ri-inv .inv.bold .bth{background:var(--accent);color:#fff;display:flex;gap:8px;padding:12px 16px}',
    '.ri-inv .inv.bold .bth .thc{color:#fff}',
    '.ri-inv .inv.bold .btr{display:flex;gap:8px;padding:12px 16px}',
    '.ri-inv .inv.bold .btr.alt{background:#fafafa}',
    '.ri-inv .inv.bold .btr .tc{color:#27272a}',
    '.ri-inv .inv.bold .bsum{width:320px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;display:flex;flex-direction:column}',
    '.ri-inv .inv.bold .bsrow{display:flex;justify-content:space-between;gap:12px;padding:10px 16px}',
    '.ri-inv .inv.bold .bsrow.alt{background:#fafafa}',
    '.ri-inv .inv.bold .bsrow.last{background:var(--accent)}',
    '.ri-inv .inv.bold .bsrow .sl{color:#52525b}',
    '.ri-inv .inv.bold .bsrow .sv{color:#18181b;font-weight:500}',
    '.ri-inv .inv.bold .bsrow.last .sl,.ri-inv .inv.bold .bsrow.last .sv{color:#fff;font-weight:700}',
    '.ri-inv .inv.bold .bsrow.last .sv{font-size:16px}',
    '.ri-inv .inv.bold .mbcards{display:flex;flex-wrap:wrap;gap:16px;padding:0 48px}',
    '.ri-inv .inv.bold .mbcard{flex:1;min-width:180px;padding:16px;border-radius:8px;background:#fafafa;border:1px solid #f4f4f5}',
    '.ri-inv .inv.bold .mbcard .mi-k{font-size:11px;font-weight:600;color:#71717a;margin-bottom:2px}',
    '.ri-inv .inv.bold .mbcard .mi-v{font-size:13px;color:#3f3f46}',
    '.ri-inv .inv.bold .sig-l{font-size:11px;color:#71717a;margin-bottom:4px}',
    '.ri-inv .inv.bold .bfoot{margin:0 48px;padding-top:16px;border-top:1px solid #e4e4e7;display:flex;flex-direction:column;gap:4px}',
    '.ri-inv .inv.bold .bfoot .ft{font-size:14px;color:#18181b}',
    '.ri-inv .inv.bold .bfoot .fb{font-size:12px;color:#71717a}',
    '.ri-inv .inv.bold .cnote{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-weight:400;padding:8px 12px}',
    '.ri-inv .inv.bold .copy{font-size:11px;color:#71717a}',
    '.ri-inv .mdh{font-weight:700;line-height:1.3}',
    '.ri-inv .mdh1{font-size:22px}.ri-inv .mdh2{font-size:20px}.ri-inv .mdh3{font-size:18px}.ri-inv .mdh4{font-size:16px}.ri-inv .mdh5{font-size:15px}.ri-inv .mdh6{font-size:14px}.ri-inv .mdh7{font-size:13px}',
    '.ri-inv .mdp{line-height:1.5}',
    '.ri-inv .mdul,.ri-inv .mdol{margin:2px 0;padding-left:20px}',
    '.ri-inv .mdq{margin:2px 0;padding:2px 10px;border-left:3px solid #d4d4d8;color:#52525b}',
    '.ri-inv .mdsp{height:6px}',
    '.ri-inv code{background:#f4f4f5;border-radius:4px;padding:1px 5px;font-family:ui-monospace,Menlo,monospace;font-size:.92em}'
  ].join('\n');

  /* ═══ Shell + mount ═══ */

  var FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:wght@400;700&family=IBM+Plex+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Space+Grotesk:wght@400;700&family=DM+Sans:wght@400;700&family=Fraunces:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Instrument+Sans:wght@400;700&family=Newsreader:wght@400;700&display=swap';

  function injectFonts() {
    if (document.getElementById('ri-embed-fonts')) return;
    var l = document.createElement('link');
    l.id = 'ri-embed-fonts';
    l.rel = 'stylesheet';
    l.href = FONTS_HREF;
    document.head.appendChild(l);
  }

  var SHELL =
    '<header class="ri-topbar">' +
    '  <div class="ri-brand">RenderInvoice <span>playground</span></div>' +
    '  <div class="ri-docwrap"><input class="ri-docinput" data-ri="docName" spellcheck="false" aria-label="Document name"><span class="ri-saved" data-ri="savedAt"></span></div>' +
    '  <button class="btn" data-ri="btnExample">Example</button>' +
    '  <button class="btn" data-ri="btnBlank">Blank</button>' +
    '  <button class="btn" data-ri="btnLink" title="Copy a share link carrying this invoice">Copy link</button>' +
    '  <button class="btn" data-ri="btnCopyJson">Copy JSON</button>' +
    '  <button class="btn" data-ri="btnDlJson">Download JSON</button>' +
    '  <button class="btn primary" data-ri="btnPrint">Print / PDF</button>' +
    '</header>' +
    '<main class="ri-main">' +
    '  <section class="card editor-card">' +
    '    <div class="edtabs">' +
    '      <button class="edtab active" data-ri="tabForm">Form</button>' +
    '      <button class="edtab" data-ri="tabJson">JSON</button>' +
    '      <span class="edhint">Visual · use arrows to reorder</span>' +
    '    </div>' +
    '    <div class="pane" data-ri="draftSlot" hidden></div>' +
    '    <div class="pane" data-ri="formPane">' +
    '      <nav class="formnav">' +
    '        <button class="fnav active" data-nav="content">Content <span class="fbadge" data-ri="cnt-content" hidden></span></button>' +
    '        <button class="fnav" data-nav="design">Design <span class="fbadge" data-ri="cnt-design" hidden></span></button>' +
    '        <button class="fnav" data-nav="settings">Settings <span class="fbadge" data-ri="cnt-settings" hidden></span></button>' +
    '      </nav>' +
    '      <div class="issues" data-ri="issuesBox" hidden></div>' +
    '      <div id="form-tab-content"></div>' +
    '      <div id="form-tab-design" style="margin-top:24px;padding-top:20px;border-top:1px solid #f4f4f5"></div>' +
    '      <div id="form-tab-settings" style="margin-top:24px;padding-top:20px;border-top:1px solid #f4f4f5"></div>' +
    '    </div>' +
    '    <div class="pane" data-ri="jsonPane" hidden>' +
    '      <div class="jsonwarn">' +
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;margin-top:1px"><path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.6 7.5 20 9 13.6 4 10l6.1-1.2z"/></svg>' +
    '        <div><strong>This is the invoice JSON.</strong> Missing commas or invalid types will break the preview.' +
    '          <button class="lnk" data-ri="lnkForm">Form view</button> ·' +
    '          <button class="lnk" data-ri="lnkSchema">Schema</button> ·' +
    '          <button class="lnk" data-ri="lnkCopySchema">Copy schema</button>' +
    '          <div data-ri="schemaSlot"></div>' +
    '        </div>' +
    '      </div>' +
    '      <textarea class="inp" data-ri="jsonText" spellcheck="false" style="min-height:420px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.6" placeholder="Paste invoice JSON here"></textarea>' +
    '      <div class="jerr" data-ri="jsonErr"></div>' +
    '      <div style="margin-top:12px;display:flex;justify-content:flex-end"><button class="btn" data-ri="btnUpdate">Update preview</button></div>' +
    '    </div>' +
    '    <div class="edfoot">' +
    '      <div class="kbds"><kbd>⌘↵</kbd> print PDF <span style="color:#d4d4d8">·</span> <kbd>⌘J</kbd> switch tab</div>' +
    '      <span class="issuecount" data-ri="issueCount"></span>' +
    '    </div>' +
    '  </section>' +
    '  <section class="card preview-card">' +
    '    <div class="pvbar">' +
    '      <div style="display:flex;align-items:center;min-width:0">' +
    '        <span class="dots"><i style="background:#f87171"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i></span>' +
    '        <span class="pvfile" data-ri="pvFile"></span>' +
    '      </div>' +
    '      <span class="live">Live</span>' +
    '    </div>' +
    '    <div class="ri-previewScroll" data-ri="previewScroll"><div class="ri-scaleWrap" data-ri="scaleWrap"><div class="ri-invPage" data-ri="invPage"></div></div></div>' +
    '  </section>' +
    '</main>' +
    '<div class="toast" data-ri="toast"></div>';

  function ref(name) { return ui.root.querySelector('[data-ri="' + name + '"]'); }

  function toast(msg) {
    if (!ui) return;
    var t = ui.toast;
    t.textContent = msg;
    t.classList.add('show');
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  /* ═══ Refresh pipeline ═══ */

  function refresh() {
    errMap = {};
    validate(state).forEach(function (e) { if (!(e.path in errMap)) errMap[e.path] = e.message; });

    var counts = { content: 0, design: 0, settings: 0 };
    Object.keys(errMap).forEach(function (path) {
      var top = path.split('.')[0];
      var t = TAB_OF[top] || TAB_OF[path] || 'content';
      counts[t]++;
    });
    ['content', 'design', 'settings'].forEach(function (t) {
      var b = ref('cnt-' + t);
      b.hidden = counts[t] === 0;
      b.textContent = counts[t];
    });

    var n = Object.keys(errMap).length;
    var box = ref('issuesBox');
    box.hidden = n === 0;
    box.textContent = n + (n === 1 ? ' issue' : ' issues') + ': check the highlighted tab to fix.';
    ref('issueCount').textContent = n ? n + (n === 1 ? ' issue' : ' issues') : '';

    ui.root.querySelectorAll('[data-err]').forEach(function (slot) {
      slot.textContent = errMap[slot.getAttribute('data-err')] || '';
    });
    ui.root.querySelectorAll('[data-bind]').forEach(function (inp) {
      inp.classList.toggle('invalid', !!errMap[inp.getAttribute('data-bind')]);
    });
    ui.root.querySelectorAll('[data-err-target]').forEach(function (inp) {
      inp.classList.toggle('invalid', !!errMap[inp.getAttribute('data-err-target')]);
    });

    renderPreview();

    var docName = resolveFilename(state);
    ref('pvFile').textContent = docName;
    var dn = ref('docName');
    if (document.activeElement !== dn) dn.value = docName;

    if (activeTab === 'json' && document.activeElement !== ui.jsonText) {
      ui.jsonText.value = JSON.stringify(state, null, 2);
    }

    scheduleSave();
  }

  function renderPreview() {
    ui.invPage.innerHTML = renderInvoiceHtml(state);
    window.requestAnimationFrame(scalePreview);
  }

  function scalePreview() {
    var avail = ui.previewScroll.clientWidth - 32;
    var s = Math.min(1, avail / 900);
    ui.scaleWrap.style.transform = 'scale(' + s + ')';
    var h = ui.invPage.offsetHeight;
    ui.scaleWrap.style.height = h + 'px';
    ui.scaleWrap.style.width = '900px';
    ui.scaleWrap.style.marginBottom = (-(h * (1 - s))) + 'px';
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      var ok = store.set(DRAFT_KEY, JSON.stringify({ at: Date.now(), invoice: state }));
      storageOk = ok;
      ref('savedAt').textContent = ok
        ? 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Storage unavailable';
    }, 800);
  }

  /* ═══ Tabs / JSON / actions ═══ */

  function switchTab(t) {
    if (t === activeTab) return;
    if (t === 'form') {
      try {
        var parsed = JSON.parse(ui.jsonText.value);
        state = withDefaults(parsed);
        buildForm();
      } catch (e) {
        ui.jsonErr.textContent = e.message;
        return;
      }
      ui.jsonErr.textContent = '';
    } else {
      ui.jsonText.value = JSON.stringify(state, null, 2);
      ui.jsonErr.textContent = '';
    }
    activeTab = t;
    ref('tabForm').classList.toggle('active', t === 'form');
    ref('tabJson').classList.toggle('active', t === 'json');
    ref('formPane').hidden = t !== 'form';
    ref('jsonPane').hidden = t !== 'json';
    refresh();
  }

  function updateFromJson() {
    ui.jsonErr.textContent = '';
    try {
      state = withDefaults(JSON.parse(ui.jsonText.value));
      buildForm();
      refresh();
    } catch (e) {
      ui.jsonErr.textContent = e.message;
    }
  }

  function buildSchemaPanel() {
    if (ui.schemaSlot.dataset.built) return;
    var rows = SCHEMA_DOC.map(function (r) {
      return '<tr><td>' + esc(r.k) + '</td><td>' + esc(r.t) + '</td><td>' + esc(r.d) + '</td></tr>';
    }).join('');
    ui.schemaSlot.innerHTML = '<div class="schemalist"><table><tbody>' + rows + '</tbody></table></div>';
    ui.schemaSlot.dataset.built = '1';
  }

  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast(okMsg); } catch (e) { toast('Copy failed'); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    } else fallback();
  }

  function downloadJson() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = resolveFilename(state) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copyShareLink() {
    var hash = jsonShareHash(state);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    }
    copyText(window.location.href, 'Share link copied');
  }

  function printInvoice() {
    document.body.classList.add('ri-printing');
    var done = function () {
      document.body.classList.remove('ri-printing');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.setTimeout(function () { window.print(); }, 50);
    window.setTimeout(done, 2000);
  }

  function loadInvoice(inv) {
    state = withDefaults(clone(inv));
    buildForm();
    refresh();
  }

  function showDraftBanner(draft) {
    var slot = ref('draftSlot');
    slot.hidden = false;
    slot.innerHTML = '';
    var b = el('div', 'banner');
    b.appendChild(el('div', null, 'Unsaved draft from ' + new Date(draft.at).toLocaleString() + '.'));
    var row = el('div', 'row');
    var dismiss = el('button', 'btn', 'Dismiss');
    dismiss.addEventListener('click', function () {
      store.del(DRAFT_KEY);
      slot.hidden = true;
    });
    var restore = el('button', 'btn amber', 'Restore');
    restore.addEventListener('click', function () {
      loadInvoice(draft.invoice);
      store.del(DRAFT_KEY);
      slot.hidden = true;
      toast('Draft restored');
    });
    row.appendChild(dismiss);
    row.appendChild(restore);
    b.appendChild(row);
    slot.appendChild(b);
  }

  /* ═══ Mount ═══ */

  function mount(target, opts) {
    opts = opts || {};
    injectCss();
    injectFonts();

    if (ui && ui.root && ui.destroy) { try { ui.destroy(); } catch (e) {} }

    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) throw new Error('RenderInvoicePlayground.mount: target not found');
    root.innerHTML = SHELL;
    root.classList.add('rip-root');

    ui = {
      root: root,
      docName: ref('docName'),
      savedAt: ref('savedAt'),
      draftSlot: ref('draftSlot'),
      formPane: ref('formPane'),
      jsonPane: ref('jsonPane'),
      jsonText: ref('jsonText'),
      jsonErr: ref('jsonErr'),
      schemaSlot: ref('schemaSlot'),
      previewScroll: ref('previewScroll'),
      scaleWrap: ref('scaleWrap'),
      invPage: ref('invPage'),
      toast: ref('toast')
    };

    state = withDefaults(clone(opts.invoice || window.INVOICE_DATA || EXAMPLE));

    ref('btnExample').addEventListener('click', function () { loadInvoice(EXAMPLE); toast('Example loaded'); });
    ref('btnBlank').addEventListener('click', function () { loadInvoice(BLANK); toast('Blank invoice'); });
    ref('btnLink').addEventListener('click', copyShareLink);
    ref('btnCopyJson').addEventListener('click', function () { copyText(JSON.stringify(state, null, 2), 'JSON copied'); });
    ref('btnDlJson').addEventListener('click', downloadJson);
    ref('btnPrint').addEventListener('click', printInvoice);

    ref('tabForm').addEventListener('click', function () { switchTab('form'); });
    ref('tabJson').addEventListener('click', function () { switchTab('json'); });
    ref('lnkForm').addEventListener('click', function () { switchTab('form'); });
    ref('lnkSchema').addEventListener('click', function () {
      if (!ui.schemaSlot.dataset.built) {
        buildSchemaPanel();
        ui.schemaSlot.hidden = false;
      } else {
        ui.schemaSlot.hidden = !ui.schemaSlot.hidden;
      }
    });
    ref('lnkCopySchema').addEventListener('click', function () {
      copyText(JSON.stringify(SCHEMA_DOC, null, 2), 'Schema copied');
    });
    ref('btnUpdate').addEventListener('click', updateFromJson);

    ui.docName.addEventListener('input', function () {
      state.filename = ui.docName.value;
      refresh();
    });

    ui.formPane.addEventListener('input', function (e) {
      var bind = e.target.getAttribute && e.target.getAttribute('data-bind');
      if (!bind) return;
      var val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setPath(state, bind, val);
      refresh();
    });

    ui.formPane.addEventListener('click', function (e) {
      var nav = e.target.closest && e.target.closest('[data-nav]');
      if (!nav) return;
      ui.formPane.querySelectorAll('[data-nav]').forEach(function (x) { x.classList.remove('active'); });
      nav.classList.add('active');
      var panel = q('#form-tab-' + nav.getAttribute('data-nav'));
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    ui.jsonText.addEventListener('input', function () { ui.jsonErr.textContent = ''; });

    function onKey(e) {
      var mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'Enter') { e.preventDefault(); printInvoice(); }
      if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); switchTab(activeTab === 'json' ? 'form' : 'json'); }
    }
    document.addEventListener('keydown', onKey);

    function onResize() { scalePreview(); }
    window.addEventListener('resize', onResize);

    function onImgLoad(e) {
      if (e.target && e.target.tagName === 'IMG') scalePreview();
    }
    ui.previewScroll.addEventListener('load', onImgLoad, true);

    ui.destroy = function () {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      ui.previewScroll.removeEventListener('load', onImgLoad);
      window.clearTimeout(saveTimer);
      root.classList.remove('rip-root');
      root.innerHTML = '';
      ui = null;
    };

    buildForm();

    var shared = opts.skipHash ? null : decodeShareHash(window.location.hash);
    if (shared) {
      state = shared;
      buildForm();
    } else {
      var raw = store.get(DRAFT_KEY);
      if (raw) {
        try {
          var draft = JSON.parse(raw);
          if (draft && draft.invoice) showDraftBanner(draft);
        } catch (e) {}
      }
    }

    refresh();

    var api = {
      getJson: function () { return clone(state); },
      getJsonString: function () { return JSON.stringify(state, null, 2); },
      loadJson: function (json) {
        try {
          loadInvoice(typeof json === 'string' ? JSON.parse(json) : json);
          return true;
        } catch (e) { return false; }
      },
      print: printInvoice,
      destroy: function () { if (ui && ui.destroy) ui.destroy(); }
    };

    if (opts.exposeGlobals !== false) {
      window.getInvoiceJson = function () { return api.getJsonString(); };
      window.loadInvoiceJson = function (str) { return api.loadJson(str); };
      window.printInvoiceSheet = printInvoice;
    }

    return api;
  }

  return {
    version: VERSION,
    mount: mount,
    render: renderInvoiceHtml,
    validate: validatePublic,
    markdown: { block: md, inline: mdi }
  };
})();
