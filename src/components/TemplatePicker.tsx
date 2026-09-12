import Dialog from './Dialog'
import { templates, type TemplateId } from '../lib/templates'
export default function TemplatePicker({
  onClose,
  onChoose,
}: {
  onClose: () => void
  onChoose: (id: TemplateId) => void
}) {
  return (
    <Dialog title="Where shall we start?" onClose={onClose}>
      <p>Start small. Make it your own.</p>
      <div className="template-grid">
        {templates.map((t) => (
          <button
            className="template-option"
            key={t.id}
            onClick={() => onChoose(t.id)}
          >
            <span className="template-icon">{t.icon}</span>
            <strong>{t.name}</strong>
            <p>{t.description}</p>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
