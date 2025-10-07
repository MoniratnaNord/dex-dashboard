import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CurrentFundingRow, MeanFundingRow } from '../types';

interface DataTableProps {
  title: string;
  data: CurrentFundingRow[] | MeanFundingRow[];
  type: 'current' | 'mean';
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DataTable({ title, data, type, currentPage, totalPages, onPageChange }: DataTableProps) {
  return (
    <div className="bg-[#1f1f1f] rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-medium">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800 bg-[#181818]">
              <th className="text-left px-4 py-3 font-medium">
                market
              </th>
              <th className="text-left px-4 py-3 font-medium">
                Δ (delta)
              </th>
              <th className="text-left px-4 py-3 font-medium">
                extended
              </th>
              {type === 'current' && (
                <th className="text-left px-4 py-3 font-medium"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-300">
                  {'rate' in row ? row.market : row.market}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {'delta' in row && row.delta !== null ? `${row.delta}%` :
                   'delta' in row && typeof row.delta === 'string' ? row.delta : ''}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {row.extended}
                </td>
                {type === 'current' && 'rate' in row && (
                  <td className="px-4 py-3 text-gray-300">
                    {row.rate}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded">
          {currentPage}
        </button>

        <span className="text-gray-500">...</span>

        <button className="px-3 py-1 text-gray-400 hover:text-white text-sm transition-colors">
          {totalPages}
        </button>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
