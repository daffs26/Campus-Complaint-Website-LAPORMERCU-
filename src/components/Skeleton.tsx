export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-5 bg-gray-200 rounded-lg w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-lg w-16" /></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded-xl w-32 ml-auto" /></td>
    </tr>
  );
}
