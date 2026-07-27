const variants = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-violet-100 text-violet-700',
  won:       'bg-emerald-100 text-emerald-700',
  lost:      'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
    ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

export default StatusBadge;
