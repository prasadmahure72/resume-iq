export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="p-8 text-text-primary">
      Results for analysis {id} — coming soon.
    </div>
  )
}
