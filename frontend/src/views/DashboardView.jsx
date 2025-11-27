import { 
  Activity, 
  Server, 
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { COLORS } from '../config';

export const DashboardView = ({ systemStatus, visualData }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Model Status</h3>
            <Server className="text-indigo-500" size={20} />
          </div>
          <div className="flex items-baseline gap-4">
            <h2 className="text-md font-bold text-slate-900 text-ellipsis overflow-hidden whitespace-nowrap">
              {systemStatus?.model_name || 'Loading...'}
            </h2>
          </div>
          <div className="mt-4">
            <div className="w-auto inline-block">
              <StatusBadge status={systemStatus?.status}/>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Classes</h3>
            <BrainCircuit className="text-purple-500" size={20} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900">
            {systemStatus?.model_info?.classes ? systemStatus.model_info.classes.length : 'N/A'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">Active categories in dataset</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Accuracy</h3>
            <Activity className="text-emerald-500" size={20} />
          </div>
          <h2 className="text-4xl font-bold text-slate-900">
            {systemStatus?.model_info?.accuracy ? (systemStatus.model_info.accuracy * 100).toFixed(1) + '%' : 'N/A'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">Last training run</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md font-normal text-slate-900">Uploaded dataset class distribution</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Uploaded Data</span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visualData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                {visualData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
);
