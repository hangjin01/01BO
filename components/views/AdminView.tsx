import React from 'react';
import { ViewState, User, Trip, CheckInRecord, Expense } from '../../types';

interface AdminViewProps {
  t: any;
  userData: User | null;
  adminTrips: Trip[];
  adminExpenses: Expense[];
  adminCheckIns: CheckInRecord[];
  companyUsers: Record<string, User>;
  setView: (view: ViewState) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  t,
  userData,
  adminTrips,
  adminExpenses,
  adminCheckIns,
  companyUsers,
  setView,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h2>
        <button onClick={() => setView(ViewState.SETTINGS)} className="text-brand-orange dark:text-brand-orange font-bold">Back</button>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-orange-300">{t.admin_company_code}</p>
          <p className="text-xs text-brand-orange dark:text-brand-orange">Share this code with your employees.</p>
        </div>
        <div className="text-xl font-black tracking-widest text-brand-orange dark:text-orange-200 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
          {userData?.companyCode || 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
          <p className="text-2xl font-black text-brand-orange dark:text-brand-orange">{adminTrips.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-black text-brand-orange dark:text-brand-orange">{adminExpenses.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Trips</h3>
        {adminTrips.map(trip => (
          <div key={trip.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{trip.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{trip.destination}</p>
                <p className="text-xs text-gray-400 mt-1">User: {companyUsers[trip.userId]?.name || trip.userId}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-brand-orange dark:text-brand-orange rounded-lg">
                {trip.status}
              </span>
            </div>
          </div>
        ))}
        {adminTrips.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No trips found.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Check-ins & Check-outs</h3>
        {adminCheckIns.slice(0, 20).map(checkIn => (
          <div key={checkIn.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{checkIn.locationName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(checkIn.timestamp).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">User: {companyUsers[checkIn.userId]?.name || checkIn.userId}</p>
                {checkIn.type === 'check-out' && checkIn.nfcTagId && checkIn.nfcTagId !== 'manual' && (
                  <p className="text-[10px] font-bold text-brand-orange dark:text-brand-orange mt-1 flex items-center gap-1">
                    <span>⚡ NFC Verified</span>
                    <span className="text-gray-400 dark:text-gray-500 font-normal">(SN: {checkIn.nfcTagId})</span>
                  </p>
                )}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                checkIn.type === 'check-in' 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : checkIn.nfcTagId === 'manual'
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-orange-50 text-brand-orange dark:bg-orange-900/30 dark:text-brand-orange'
              }`}>
                {checkIn.type === 'check-in' 
                  ? 'Check-in' 
                  : checkIn.nfcTagId === 'manual'
                    ? 'Check-out (Manual)'
                    : 'Check-out (NFC)'
                }
              </span>
            </div>
          </div>
        ))}
        {adminCheckIns.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity found.</p>
        )}
      </div>
    </div>
  );
};
