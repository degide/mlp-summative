import React, { useState } from 'react';
import {
  Play, 
  CheckCircle,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { Card } from '../components/Card';
import { API_URL } from '../config';

export const RetrainView = ({fetchData}) => {
    const [className, setClassName] = useState('');
    const [files, setFiles] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);

    const handleUpload = async (e) => {
      e.preventDefault();
      if (!files || !className) return;
      
      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('class_name', className);
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      try {
        await fetch(`${API_URL}/retrain/upload`, {
          method: 'POST',
          body: formData,
        });
        setUploadStatus('success');
        setFiles(null);
        setClassName('');
        // Refresh chart data
        fetchData();
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (err) {
        console.log(err);
        setUploadStatus('error');
      }
    };

    const handleTriggerRetrain = async () => {
      try {
        const res = await fetch(`${API_URL}/retrain/trigger`, { method: 'POST' });
        const data = await res.json();
        setTaskStatus(data);
      } catch (err) {
        console.log(err);
        alert('Failed to trigger training.');
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Model Retraining Pipeline</h2>
            <p className="text-indigo-200 max-w-xl">
              Improve the model by uploading new labeled images. The system uses Celery workers to process training in the background.
            </p>
          </div>
          <BrainCircuit className="absolute right-0 bottom-0 text-indigo-800 opacity-20 -mr-8 -mb-8" size={200} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs">1</span>
              Upload Data
            </h3>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Label</label>
                <input 
                  type="text" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. elephants"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Images</label>
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={uploadStatus === 'uploading'}
                className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload to Dataset'}
              </button>
              
              {uploadStatus === 'success' && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle size={14} /> Upload successful!
                </p>
              )}
            </form>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs">2</span>
                Train Model
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Triggering this will start a background worker that processes all images in dataset folder and updates the model.
              </p>
            </div>

            <div>
              {taskStatus && (
                <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Current Job</p>
                  <p className="text-sm font-mono text-slate-700 mt-1 truncate">ID: {taskStatus.task_id}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 mt-2 bg-amber-50 px-2 py-1 rounded">
                    <Loader2 size={10} className="animate-spin" /> Processing in background
                  </span>
                </div>
              )}
              
              <button 
                onClick={handleTriggerRetrain}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                <Play size={18} fill="currentColor" />
                Start Retraining Job
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
};