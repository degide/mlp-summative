import { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2,
} from 'lucide-react';
import { Card } from '../components/Card';
import { API_URL } from '../config';

export const PredictView = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
        const selected = e.target.files[0];
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
      }
    };

    const handlePredict = async () => {
      if (!file) return;
      setPredicting(true);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.log(err);
        alert('Prediction failed. Is the backend running?');
      } finally {
        setPredicting(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Test the Model</h2>
          <p className="text-slate-500">Upload an image to see what the AI thinks it is.</p>
        </div>

        <Card className="p-8">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
              ${preview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center group">
                  <span className="bg-white/90 text-slate-700 px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-indigo-100 p-4 rounded-full inline-block">
                  <Upload className="text-green-600" size={32} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Click to upload image</p>
                  <p className="text-sm text-slate-500">JPG, PNG up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={!file || predicting}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-all
                ${!file ? 'bg-slate-300 cursor-not-allowed' : 
                  predicting ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30'}`}
            >
              {predicting ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
              {predicting ? 'Analyzing...' : 'Identify Animal'}
            </button>
          </div>
        </Card>

        {result && (
          <div className="bg-linear-to-r from-white to-white rounded-xl p-1 shadow-md animate-in zoom-in duration-300">
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Predicted Class</p>
              <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-700">
                {result.predicted_class}
              </h3>
            </div>
          </div>
        )}
      </div>
    );
};
