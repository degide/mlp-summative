import { useState, useEffect } from 'react';
import { 
  Activity, 
  Image as ImageIcon, 
  BarChart2, 
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { API_URL } from './config';
import { DashboardView } from './views/DashboardView';
import { PredictView } from './views/PredictView';
import { RetrainView } from './views/RetrainView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState(null);
  const [visualData, setVisualData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Status
      const statusRes = await fetch(`${API_URL}/status`);
      const statusJson = await statusRes.json();
      setSystemStatus(statusJson);

      // Fetch Visualizations
      const vizRes = await fetch(`${API_URL}/visualizations`);
      const vizJson = await vizRes.json();
      
      // Transform data for Recharts
      const dist = vizJson.class_distribution || {};
      const chartData = Object.keys(dist)
        .filter(k => k !== 'message')
        .map(k => ({ name: k, count: dist[k] }));
      
      setVisualData(chartData);
    } catch (err) {
      console.error("Failed to fetch backend data", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-80 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BrainCircuit size={24} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Animal Classification</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
            { id: 'predict', icon: ImageIcon, label: 'Predict' },
            { id: 'retrain', icon: Activity, label: 'Retrain Model' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${systemStatus?.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-400 font-medium">System {systemStatus?.status || 'Offline'}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-80 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'dashboard' && 'Real-time overview of model performance'}
              {activeTab === 'predict' && 'Run inference on new images'}
              {activeTab === 'retrain' && 'Manage dataset and trigger training pipelines'}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="animate-spin" /> Loading system data...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardView systemStatus={systemStatus} visualData={visualData} />}
            {activeTab === 'predict' && <PredictView />}
            {activeTab === 'retrain' && <RetrainView fetchData={fetchData} />}
          </>
        )}
      </main>
    </div>
  );
}