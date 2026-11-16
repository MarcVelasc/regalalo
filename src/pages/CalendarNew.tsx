import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PersonWizard } from '../components/PersonWizard'

/** Agregar otra persona: el mismo paso a paso del inicio */
export function CalendarNew() {
  return (
    <div className="home-wiz">
      <Link to="/calendario" className="link-btn cal-back">
        <Icon name="arrowLeft" size={15} /> Volver a mis personas
      </Link>
      <PersonWizard />
    </div>
  )
}
