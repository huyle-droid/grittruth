import {
  AudioLines,
  Check,
  Layers3,
  PenLine,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
export function StudioPreview() {
  return (
    <div
      className="studio-preview"
      aria-label="Illustrative studio preview using the fictional Fieldwork brand"
    >
      <div className="preview-top">
        <span className="preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span>GRITTRUTH / THE CREATIVE WORKSPACE</span>
        <span>01</span>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar">
          <span className="preview-monogram">f.</span>
          <strong>Fieldwork</strong>
          <span className="muted">Sample brand</span>
          <div className="preview-nav">
            <span>
              <AudioLines size={15} />
              Brand DNA
            </span>
            <span className="selected">
              <PenLine size={15} />
              Content studio
            </span>
            <span>
              <Layers3 size={15} />
              Campaigns
            </span>
          </div>
          <div className="voice-chip">
            <span className="tiny">YOUR BRAND VOICE</span>
            <p>
              Grounded.
              <br />
              Curious.
              <br />
              Unmistakably you.
            </p>
            <span>
              <Check size={13} /> DNA connected
            </span>
          </div>
        </aside>
        <div className="preview-editor">
          <div className="preview-editor-title">
            <span className="eyebrow">LET’S MAKE SOMETHING</span>
            <SlidersHorizontal size={16} />
          </div>
          <h3>Words with a point of view.</h3>
          <div className="preview-tags">
            <span>Social caption</span>
            <span>Brand voice</span>
          </div>
          <div className="sample-output">
            <div className="sample-output-heading">
              <span className="tiny">DRAFT 001</span>
              <span className="sample-label">Sample copy</span>
            </div>
            <p>
              Close the laptop.
              <br />
              Take the long way home.
            </p>
            <p>
              A coffee stop, a park bench, a small detour. Make a little room
              for outside.
            </p>
            <p className="sample-signature">
              Meet your everyday carry. — Fieldwork
            </p>
          </div>
          <div className="preview-bottom">
            <span>
              <Check size={14} /> Yours to make your own
            </span>
            <Plus size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
