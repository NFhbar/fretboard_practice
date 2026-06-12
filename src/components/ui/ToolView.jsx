import { useEscapeBack } from '../../hooks/useEscapeBack.js';

export default function ToolView({ title, badge, sub, controls, onClose, children }) {
  useEscapeBack(onClose);
  return (
    <div className="tool-view">
      <div className="tool-header">
        <div className="tool-title">{title}</div>
        {badge && <div className="badge-gold">{badge}</div>}
        {controls}
        <button className="tool-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {sub && <div className="tool-sub">{sub}</div>}
      </div>
      <div className="tool-body">{children}</div>
    </div>
  );
}
