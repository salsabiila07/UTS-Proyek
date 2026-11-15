import { Badge } from '../../components/ui/index.jsx';

export const attendanceStatuses = {
  present: { label: 'Hadir', tone: 'success' },
  permission: { label: 'Izin', tone: 'info' },
  sick: { label: 'Sakit', tone: 'warning' },
  absent: { label: 'Alfa', tone: 'danger' },
};

export function AttendanceBadge({ status }) {
  const item = attendanceStatuses[status];
  return <Badge tone={item?.tone || 'neutral'}>{item?.label || 'Belum dicatat'}</Badge>;
}

export function formatAttendanceDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
