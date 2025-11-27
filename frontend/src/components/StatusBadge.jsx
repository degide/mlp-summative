import { CheckCircle, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const isOnline = status === 'Online';
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isOnline ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {status || 'Unknown'}
    </div>
  );
};
