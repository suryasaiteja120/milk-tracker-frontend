import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="card empty empty-page">
        <span className="empty-icon"><Compass size={26} strokeWidth={1.6} /></span>
        <strong>This stop isn't on the route</strong>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary">Back to overview</Link>
      </div>
    </div>
  )
}
