export function ClassScheduleList({ schedules }) {
  if (!schedules?.length) return null;
  return <div className="student-class-schedules"><strong>Jadwal per kelas</strong><ul>{schedules.map(({ grades, day, startTime, endTime }) => <li key={`${grades.join('-')}-${day}`}><span>Kelas {grades.join(', ')}</span><span>{day}, {startTime}–{endTime}</span></li>)}</ul></div>;
}
