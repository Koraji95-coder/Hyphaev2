// src/components/dashboard/panels/MarketDashboard/PDFInsights.tsx
import React from "react";
import { Upload, X } from "lucide-react";

interface Insight { filename:string; tickers:string[]; timestamp:string; }
interface Props {
  insights: Insight[];
  showModal: boolean;
  selectedFile: File|null;
  onFileChange: (e:React.ChangeEvent<HTMLInputElement>)=>void;
  onUpload: ()=>void;
  status: "idle"|"uploading"|"success"|"error";
  onClose: ()=>void;
}

export default function PDFInsights({ insights, showModal, selectedFile, onFileChange, onUpload, status, onClose }: Props) {
  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">PDF Insights</h2>
          <button onClick={()=>onClose()} className="text-indigo-600 flex items-center gap-1">
            <Upload/> Upload PDF
          </button>
        </div>
        <div className="space-y-4">
          {insights.map((ins,i)=>(
            <div key={i} className="border-t pt-4">
              <div className="font-medium">{ins.filename}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {ins.tickers.map(t=>(
                  <span key={t} className="px-2 py-1 bg-indigo-50 rounded-full text-xs">${t}</span>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">{new Date(ins.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload PDF</h3>
              <button onClick={onClose}><X/></button>
            </div>
            <input type="file" accept=".pdf" onChange={onFileChange} />
            <button
              onClick={onUpload}
              disabled={!selectedFile || status==="uploading"}
              className="mt-4 w-full py-2 bg-indigo-600 text-white rounded"
            >
              {status==="uploading"?"Uploading…":"Upload"}
            </button>
            {status==="error" && <p className="text-red-500">Upload failed</p>}
          </div>
        </div>
      )}
    </div>
  );
}
