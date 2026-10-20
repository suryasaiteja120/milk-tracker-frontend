import { money } from '../lib/format'

/** Renders ₹ in a fallback font (Hina Mincho has no rupee glyph) + Indian grouping. */
export default function Money({ value }) {
  return (
    <>
      <span className="rupee">₹</span>
      {money(value)}
    </>
  )
}
