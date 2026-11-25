export function SectionTitle({
  index,
  title,
  caption,
}: {
  index: string
  title: string
  caption: string
}) {
  return (
    <div className="section-heading">
      <span className="section-index">{index}</span>
      <span>
        <strong>{title}</strong>
        <small>{caption}</small>
      </span>
    </div>
  )
}