export type ThemeKey = 'default' | 'minimal' | 'dark-accent';

export interface Theme {
  key: ThemeKey;
  name: string;
  container: string;
  heading: string;
  accent: string;
  border: string;
  tableHead: string;
  summaryLabel: string;
  summaryValue: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  default: {
    key: 'default',
    name: 'Default',
    container: 'bg-white text-gray-900',
    heading: 'text-gray-800',
    accent: 'text-blue-600',
    border: 'border-gray-200',
    tableHead: 'text-gray-500',
    summaryLabel: 'text-gray-500',
    summaryValue: 'text-gray-800',
  },
  minimal: {
    key: 'minimal',
    name: 'Minimal',
    container: 'bg-white text-gray-900',
    heading: 'text-gray-900',
    accent: 'text-gray-900',
    border: 'border-gray-900',
    tableHead: 'text-gray-900',
    summaryLabel: 'text-gray-500',
    summaryValue: 'text-gray-900',
  },
  'dark-accent': {
    key: 'dark-accent',
    name: 'Dark Accent',
    container: 'bg-white text-gray-900',
    heading: 'text-gray-900',
    accent: 'text-indigo-700',
    border: 'border-indigo-200',
    tableHead: 'text-indigo-700',
    summaryLabel: 'text-indigo-500',
    summaryValue: 'text-gray-900',
  },
};
