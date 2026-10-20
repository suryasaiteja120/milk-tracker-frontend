import { useCallback, useMemo, useState } from 'react'
import { EditorsContext, useData, useToast } from './contexts'
import Modal from '../components/Modal'
import PurchaseForm from '../components/PurchaseForm'
import PaymentForm from '../components/PaymentForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { money, sessionOf, shortDate } from '../lib/format'

/**
 * One place that owns the add/edit drawers and the delete confirmation, so the
 * dashboard, purchases and payments pages can all simply call e.g.
 * `editors.addPurchase({ date })`.
 */
export default function EditorsProvider({ children }) {
  const { removeItem } = useData()
  const { notify } = useToast()
  const [purchaseEditor, setPurchaseEditor] = useState(null) // { initial } | null
  const [paymentEditor, setPaymentEditor] = useState(null)
  const [deleting, setDeleting] = useState(null) // { type, item } | null

  const closePurchase = useCallback(() => setPurchaseEditor(null), [])
  const closePayment = useCallback(() => setPaymentEditor(null), [])
  const closeDelete = useCallback(() => setDeleting(null), [])

  const value = useMemo(
    () => ({
      addPurchase: (initial = {}) => setPurchaseEditor({ initial }),
      editPurchase: (purchase) => setPurchaseEditor({ initial: purchase }),
      addPayment: () => setPaymentEditor({ initial: {} }),
      editPayment: (payment) => setPaymentEditor({ initial: payment }),
      askDelete: (type, item) => setDeleting({ type, item }),
    }),
    [],
  )

  const confirmDelete = async () => {
    const { type, item } = deleting
    try {
      await removeItem(type, item.id)
      notify(type === 'purchase' ? 'Purchase deleted.' : 'Payment deleted.')
    } catch (error) {
      notify(error.message, 'error')
    }
    setDeleting(null)
  }

  const deleteText = deleting
    ? deleting.type === 'purchase'
      ? {
          title: 'Delete this purchase?',
          message: `The ${sessionOf(deleting.item) === 'EVENING' ? 'evening' : 'morning'} purchase on ${shortDate(deleting.item.purchaseDate)} (₹${money(deleting.item.totalAmount)}) will be removed. This can't be undone.`,
        }
      : {
          title: 'Delete this payment?',
          message: `The ₹${money(deleting.item.amount)} payment on ${shortDate(deleting.item.paymentDate)} will be removed. This can't be undone.`,
        }
    : { title: '', message: '' }

  return (
    <EditorsContext.Provider value={value}>
      {children}

      <Modal open={Boolean(purchaseEditor)} onClose={closePurchase} variant="drawer" label={purchaseEditor?.initial?.id ? "Edit purchase" : "Add milk"}>
        {purchaseEditor && <PurchaseForm initial={purchaseEditor.initial} onClose={closePurchase} />}
      </Modal>

      <Modal open={Boolean(paymentEditor)} onClose={closePayment} variant="drawer" label={paymentEditor?.initial?.id ? "Edit payment" : "Record payment"}>
        {paymentEditor && <PaymentForm initial={paymentEditor.initial} onClose={closePayment} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleteText.title}
        message={deleteText.message}
        onConfirm={confirmDelete}
        onClose={closeDelete}
      />
    </EditorsContext.Provider>
  )
}
