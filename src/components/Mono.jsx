// Small-caps mono meta label that sits above every section header — a core
// rhythm element of the design system. Renders an optional 36px rule before
// the text when `rule` is true.
export default function Mono({ children, rule = false, as: Tag = 'span', className = '' }) {
  return (
    <Tag className={`mono-meta inline-flex items-center gap-2 ${className}`}>
      {rule && <span aria-hidden="true" className="inline-block w-9 h-px bg-ink-500" />}
      {children}
    </Tag>
  );
}
