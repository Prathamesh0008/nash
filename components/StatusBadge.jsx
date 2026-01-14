export default function StatusBadge({ status }) {
  const base = "text-xs px-2 py-1 rounded-full border";
  const map = {
    draft: "bg-gray-100 border-gray-300",
    pending: "bg-yellow-100 border-yellow-300",
    active: "bg-green-100 border-green-300",
    rejected: "bg-red-100 border-red-300",
  };

  return <span className={`${base} ${map[status] || "bg-gray-100 border-gray-300"}`}>{status}</span>;
}
