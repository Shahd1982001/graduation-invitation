export default function Envelope({ phase, onOpen }) {
  const opening = phase === 'opening'

  return (
    <div className={`envelope-scene ${opening ? 'is-opening' : ''}`} aria-label="ظرف دعوة التخرج">
      <div className="envelope">
        <div className="envelope-paper" />
        <div className="envelope-back" />
        <div className="envelope-flap" />
        <div className="envelope-front" />
        <button
          className="wax-seal"
          onClick={onOpen}
          disabled={phase !== 'closed'}
          aria-label="اضغطي على ختم الشمع لفتح الظرف"
        >
          <span>س</span>
        </button>
      </div>
    </div>
  )
}
