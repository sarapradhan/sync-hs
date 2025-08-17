export const PRIORITY_COLORS = {
  low: {
    bg: 'bg-gray-500',
    text: 'text-white',
  },
  medium: {
    bg: 'bg-orange-500',
    text: 'text-white',
  },
  high: {
    bg: 'bg-red-500',
    text: 'text-white',
  },
} as const;

export const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-100 text-blue-800',
  English: 'bg-green-100 text-green-800',
  Science: 'bg-orange-100 text-orange-800',
  History: 'bg-purple-100 text-purple-800',
  Other: 'bg-gray-100 text-gray-800',
} as const;

export const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
} as const;

export const MATERIAL_ICONS = {
  school: 'school',
  dashboard: 'dashboard',
  assignment: 'assignment',
  calendar: 'calendar_today',
  notifications: 'notifications',
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  check: 'check_circle_outline',
  schedule: 'schedule',
  person: 'person',
  upload: 'file_upload',
  export: 'table_chart',
  close: 'close',
  settings: 'settings',
} as const;
