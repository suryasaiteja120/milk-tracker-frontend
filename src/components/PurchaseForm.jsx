import { useId, useState } from 'react'
import { CircleAlert, Sunrise, Sunset, X } from 'lucide-react'
import Money from './Money'
import { useData, useToast } from '../context/contexts'
import { longDate, sessionOf, todayISO } from '../lib/format'

function readDefaults() {
  return {
    quantity: localStorage.getItem('milkTrackerDefaultQuantity') || '1',
    price: localStorage.getItem('milkTrackerDefaultPrice') || '',
  }
}

/**
 * `initial` is either an existing purchase (has `id`) or a hint for a new one:
 * { date?, session? }.
 */
export default function PurchaseForm({ initial, onClose }) {
  const { savePurchase } = useData()
  const { notify } = useToast()
  const uid = useId()
  const editing = Boolean(initial?.id)

  const [values, setValues] = useState(() => {
    const defaults = readDefaults()
    return {
      purchaseDate: initial?.purchaseDate ?? initial?.date ?? todayISO(),
      session: initial?.session ? sessionOf(initial) : 'MORNING',
      quantity: editing ? String(initial.quantity) : defaults.quantity,
      pricePerLiter: editing ? String(initial.pricePerLiter) : defaults.price,
    }
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))
  const total = (Number(values.quantity) || 0) * (Number(values.pricePerLiter) || 0)

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!values.purchaseDate) next.purchaseDate = 'Choose the date of the purchase.'
    if (!(Number(values.quantity) > 0)) next.quantity = 'Enter a quantity greater than 0.'
    if (!(Number(values.pricePerLiter) > 0)) next.pricePerLiter = 'Enter a price greater than 0.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await savePurchase(
        {
          purchaseDate: values.purchaseDate,
          session: values.session,
          quantity: Number(values.quantity),
          pricePerLiter: Number(values.pricePerLiter),
        },
        initial?.id,
      )
      notify(editing ? 'Purchase updated.' : 'Purchase saved.')
      onClose()
    } catch (error) {
      setFormError(error.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="drawer-form">
      <div className="drawer-head">
        <div>
          <h2 id={`${uid}-title`}>{editing ? 'Edit purchase' : 'Add milk'}</h2>
          <p>{editing ? longDate(values.purchaseDate) : 'Record what you bought for a morning or evening session.'}</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={19} strokeWidth={1.6} />
        </button>
      </div>

      <div className="drawer-body">
        {formError && (
          <div className="form-error" role="alert">
            <CircleAlert size={18} strokeWidth={1.75} />
            <span>{formError}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor={`${uid}-date`}>Date</label>
          <input
            id={`${uid}-date`}
            type="date"
            className="input"
            value={values.purchaseDate}
            onChange={set('purchaseDate')}
            aria-invalid={Boolean(errors.purchaseDate)}
            data-autofocus
          />
          {errors.purchaseDate && <span className="field-error">{errors.purchaseDate}</span>}
        </div>

        <div className="field" role="radiogroup" aria-label="Session">
          <span className="field-label">Session</span>
          <div className="segmented segmented-block segmented-large">
            <button
              type="button"
              role="radio"
              aria-checked={values.session === 'MORNING'}
              data-tone="morning"
              className="segment"
              onClick={() => setValues((p) => ({ ...p, session: 'MORNING' }))}
            >
              <Sunrise size={19} strokeWidth={1.6} /> Morning
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={values.session === 'EVENING'}
              data-tone="evening"
              className="segment"
              onClick={() => setValues((p) => ({ ...p, session: 'EVENING' }))}
            >
              <Sunset size={19} strokeWidth={1.6} /> Evening
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor={`${uid}-qty`}>Quantity (litres)</label>
            <input
              id={`${uid}-qty`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              className="input"
              placeholder="e.g. 2"
              value={values.quantity}
              onChange={set('quantity')}
              aria-invalid={Boolean(errors.quantity)}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-price`}>Price per litre</label>
            <input
              id={`${uid}-price`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className="input"
              placeholder="e.g. 60"
              value={values.pricePerLiter}
              onChange={set('pricePerLiter')}
              aria-invalid={Boolean(errors.pricePerLiter)}
            />
            {errors.pricePerLiter && <span className="field-error">{errors.pricePerLiter}</span>}
          </div>
        </div>

        <div className="total-box" aria-live="polite">
          <span>Total amount</span>
          <strong>
            <Money value={total} />
          </strong>
        </div>
      </div>

      <div className="drawer-foot">
        <button type="button" className="btn btn-quiet" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner" />}
          {editing ? 'Save changes' : 'Save purchase'}
        </button>
      </div>
    </form>
  )
}
