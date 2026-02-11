export default function SectionCard({ title, anchor, children }) {
  return (
    <>
      <section className="card">
        <h3 id={anchor} className="heading-link">
          <b>{title}</b>
          {anchor && (
            <a href={`#${anchor}`} className="anchor-icon">🔗</a>
          )}
        </h3>
        {children}
      </section>
      <hr className="view-line" />
    </>
  );
}
