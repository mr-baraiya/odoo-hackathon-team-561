import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full items-center justify-center min-h-screen bg-slate-50 text-slate-900 px-4">
      <div className="text-center max-w-lg">
        {/* Brand Header */}
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <img src="/logo.svg" alt="DealFlow360 Logo" className="w-10 h-10 rounded-xl shadow-xs" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              DealFlow<span className="text-indigo-600">360</span>
            </span>
          </Link>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-8 text-sm">
          Oops! The page or deal record you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/dealflow/pipeline")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center transition-all"
          >
            Back to Sales Pipeline
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center transition-all"
          >
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <p className="text-xs text-slate-400">DealFlow360 Enterprise B2B Sales Operations Platform</p>
        </div>
      </div>
    </div>
  );
}

