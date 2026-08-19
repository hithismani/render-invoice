import { z } from 'zod';
import { InvoiceSchema } from '@/schema/invoiceSchema';

export interface SchemaField {
  key: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
  description?: string;
  children?: SchemaField[];
}

function describe(schema: z.ZodTypeAny): Omit<SchemaField, 'key'> {
  const description: string = schema._def.description || '';
  let optional = false;
  let defaultValue: string | undefined;
  let current: z.ZodTypeAny = schema;

  if (current._def.typeName === 'ZodOptional') { optional = true; current = current._def.innerType; }
  if (current._def.typeName === 'ZodDefault') {
    optional = true;
    try { defaultValue = JSON.stringify(current._def.defaultValue()); } catch { /* */ }
    current = current._def.innerType;
  }
  if (current._def.typeName === 'ZodEffects') current = current._def.schema;

  const cdef = current._def;
  let type = String(cdef.typeName || 'Unknown').replace(/^Zod/, '');
  let children: SchemaField[] | undefined;

  switch (cdef.typeName) {
    case 'ZodObject':
      children = introspect(current as z.ZodObject<any>);
      type = 'Object';
      break;
    case 'ZodArray': {
      const item = describe(cdef.type);
      type = `Array<${item.type}>`;
      children = item.children;
      break;
    }
    case 'ZodUnion':
      type = cdef.options.map((o: z.ZodTypeAny) => describe(o).type).join(' | ');
      break;
    case 'ZodEnum':
      type = (cdef.values as string[]).map((v) => JSON.stringify(v)).join(' | ');
      break;
    case 'ZodRecord':
      type = `Record<string, ${describe(cdef.valueType).type}>`;
      break;
    case 'ZodString': type = 'string'; break;
    case 'ZodNumber': type = 'number'; break;
    case 'ZodBoolean': type = 'boolean'; break;
  }

  return { type, optional, defaultValue, description, children };
}

export function introspect(schema: z.ZodObject<any>): SchemaField[] {
  const shape: Record<string, z.ZodTypeAny> = schema.shape;
  return Object.keys(shape).map((key) => ({ key, ...describe(shape[key]) }));
}

export function invoiceSchemaFields(): SchemaField[] {
  return introspect(InvoiceSchema as unknown as z.ZodObject<any>);
}
