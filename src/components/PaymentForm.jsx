import { useId, useState } from 'react'
import { CircleAlert, X } from 'lucide-react'
import Money from './Money'
import { useData, useToast } from '../context/contexts'
import { todayISO } from '../lib/format'

export default function PaymentForm({ initial, onClose }) {
  const { savePayment, dashboard } = useData()
  const { notify } = useToast()
  const uid = useId()
  const editing = Boolean(initial?.id)
  const due = Number(dashboard?.balanceDue) || 0

  const [values, setValues] = useState(() => ({
    paymentDate: initial?.paymentDate ?? todayISO(),
    amount: editing ? String(initial.amount) : '',
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!values.paymentDate) next.paymentDate = 'Choose the date of the payment.'
    if (!(Number(values.amount) > 0)) next.amount = 'Enter an amount greater than 0.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await savePayment({ paymentDate: values.paymentDate, amount: Number(values.amount) }, initial?.id)
      notify(editing ? 'Payment updated.' : 'Payment recorded.')
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
          <h2 id={`${uid}-title`}>{editing ? 'Edit payment' : 'Record payment'}</h2>
          <p>{editing ? 'Update the details of this payment.' : 'Log money you paid for your milk.'}</p>
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
          <label htmlFor={`${uid}-date`}>Payment date</label>
          <input
            id={`${uid}-date`}
            type="date"
            className="input"
            value={values.paymentDate}
            onChange={(e) => setValues((p) => ({ ...p, paymentDate: e.target.value }))}
            aria-invalid={Boolean(errors.paymentDate)}
            data-autofocus
          />
          {errors.paymentDate && <span className="field-error">{errors.paymentDate}</span>}
        </div>

        <div className="field">
          <label htmlFor={`${uid}-amount`}>Amount</label>
          <input
            id={`${uid}-amount`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            className="input"
            placeholder="e.g. 300"
            value={values.amount}
            onChange={(e) => setValues((p) => ({ ...p, amount: e.target.value }))}
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
          {due > 0 && (
            <p className="field-hint">
              Balance due this month: <Money value={due} />{' '}
              <button type="button" className="link-button" onClick={() => setValues((p) => ({ ...p, amount: String(due) }))}>
                Pay full balance
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="drawer-foot">
        <button type="button" className="btn btn-quiet" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner" />}
          {editing ? 'Save changes' : 'Record payment'}
        </button>
      </div>
    </form>
  )
}
