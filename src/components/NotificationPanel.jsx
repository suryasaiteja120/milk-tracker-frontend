import { BellRing, Check, Milk, Wallet, Trash2 } from 'lucide-react'
import { useData } from '../context/contexts'
import { timeAgo } from '../lib/format'

const ICONS = { PAYMENT: Wallet, REMINDER: BellRing }

export default function NotificationPanel() {
  const { notifications, markRead, markAllRead, deleteNotification } = useData()
  const unread = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="popover notification-panel" role="dialog" aria-label="Notifications">
      <div className="popover-head">
        <div>
          <h2>Notifications</h2>
          <p>{unread > 0 ? `${unread} unread` : 'You are all caught up'}</p>
        </div>
        {unread > 0 && (
          <button type="button" className="link-button" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications === null ? (
          <div className="notification-skeletons">
            <div className="skeleton" style={{ height: 64 }} />
            <div className="skeleton" style={{ height: 64 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">
              <BellRing size={22} strokeWidth={1.6} />
            </span>
            <strong>No notifications yet</strong>
            <p>Payment confirmations and milk reminders will show up here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Milk
            return (
              <article key={n.id} className={`notification ${n.read ? '' : 'is-unread'}`}>
                <span className="notification-icon">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="notification-body">
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>{timeAgo(n.createdAt)}</small>
                </div>
                <div className="notification-actions">
  {!n.read && (
    <button
      type="button"
      className="icon-btn icon-btn-sm"
      onClick={() => markRead(n.id)}
      aria-label="Mark as read"
      title="Mark as read"
    >
      <Check size={16} strokeWidth={1.75} />
    </button>
  )}

  <button
    type="button"
    className="icon-btn icon-btn-sm"
    onClick={() => deleteNotification(n.id)}
    aria-label="Delete notification"
    title="Delete notification"
  >
    <Trash2 size={16} strokeWidth={1.75} />
  </button>
</div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
