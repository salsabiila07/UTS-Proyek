import { Badge } from '../../components/ui/index.jsx';

export const registrationStatusText = {
  pending: 'Menunggu',
  accepted: 'Diterima',
  rejected: 'Ditolak',
};

const statusTone = { pending: 'warning', accepted: 'success', rejected: 'danger' };

export function RegistrationBadge({ status }) {
  return <Badge tone={statusTone[status] || 'neutral'}>{registrationStatusText[status] || 'Tidak diketahui'}</Badge>;
}

export function formatRegistrationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
