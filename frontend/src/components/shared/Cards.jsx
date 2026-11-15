import { Badge, Card } from '../ui/index.jsx';

export function ScheduleCard({ title, date, time, location, status, statusTone = 'neutral', coach, className = '', children }) {
  return <Card className={`ui-content-card ${className}`}><div className="ui-content-card__heading"><h3>{title}</h3>{status && <Badge tone={statusTone}>{status}</Badge>}</div><p>{date}{time && ` · ${time}`}</p>{location && <p>{location}</p>}{coach && <small>Pembina: {coach}</small>}{children}</Card>;
}

export function ExtracurricularCard({ name, description, schedule, coach, image, action }) {
  return <Card className="ui-extracurricular-card">{image && <img className="ui-extracurricular-card__image" src={image} alt="" loading="lazy" />}<div className="ui-extracurricular-card__body"><h3>{name}</h3>{description && <p>{description}</p>}{schedule && <small>{schedule}</small>}{coach && <small>Pembina: {coach}</small>}{action && <div className="ui-extracurricular-card__action">{action}</div>}</div></Card>;
}
