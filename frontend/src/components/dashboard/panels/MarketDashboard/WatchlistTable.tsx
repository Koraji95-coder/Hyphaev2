import React from "react";

interface Quote { symbol:string; price:number; change:number; volume:number; }
interface Props {
  watchlist: Quote[];
  searchTerm: string;
  setSearchTerm: (s:string)=>void;
  onAddSymbol: () => void;
}

export default function WatchlistTable({ watchlist, searchTerm, setSearchTerm, onAddSymbol }: Props) {
  return (
    <div className="bg-dark-200 rounded-lg shadow-sm p-6 border border-dark-100/50 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Watchlist</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
            placeholder="Search symbols…"
            className="pl-2 border rounded"
          />
          <button
            type="button"
            onClick={onAddSymbol}
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Add Symbol
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th>Symbol</th><th>Price</th><th>Change</th><th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map(q=>(
              <tr key={q.symbol} className="border-t">
                <td className="py-2 font-medium">{q.symbol}</td>
                <td>${q.price.toFixed(2)}</td>
                <td className={q.change>=0?"text-green-500":"text-red-500"}>
                  {q.change>=0?"+":""}{q.change.toFixed(2)}%
                </td>
                <td>{q.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
