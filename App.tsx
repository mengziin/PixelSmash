import React, { useState, useEffect, useRef } from 'react';
import { AppView, RacketData } from './types';
import { analyzeRacketImage } from './services/gemini';
import { RacketCard } from './components/RacketCard';
import { Camera, Grid, Plus, ArrowLeft, Zap } from 'lucide-react';

// Utility to resize image before processing to save bandwidth and LocalStorage space
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1024; // Increased limit to 1024px for better clarity

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw on white background to handle transparency if any
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        // Use JPEG with 0.95 quality for better details
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = (e) => reject(new Error("Failed to load image"));
    };
    reader.onerror = (e) => reject(new Error("Failed to read file"));
  });
};

const TypewriterLogs: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  
  const targetLines = [
    "扫描球拍结构...",
    "识别型号特征...",
    "生成属性面板..."
  ];

  useEffect(() => {
    if (currentLineIndex >= targetLines.length) return;

    const timer = setTimeout(() => {
      const currentLineTarget = targetLines[currentLineIndex];
      
      if (currentCharIndex < currentLineTarget.length) {
        setLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = "> " + currentLineTarget.substring(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex]);

  return (
    <div className="mt-8 font-mono text-xs text-gray-500 text-left w-64 space-y-1 min-h-[5rem]">
      {lines.map((line, idx) => (
        <p key={idx}>{line}</p>
      ))}
      <p className="animate-pulse text-retro-green">
        {currentLineIndex >= targetLines.length ? '> _' : ''}
      </p>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [collection, setCollection] = useState<RacketData[]>([]);
  const [selectedRacket, setSelectedRacket] = useState<RacketData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load collection on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pixel-smash-collection');
      if (saved) {
        setCollection(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load collection", e);
      // If load fails (e.g. corrupted data), start fresh
      localStorage.removeItem('pixel-smash-collection');
    }
  }, []);

  // Save collection on update
  useEffect(() => {
    try {
      localStorage.setItem('pixel-smash-collection', JSON.stringify(collection));
    } catch (e) {
      console.error("Failed to save collection - likely quota exceeded", e);
      alert("Storage full! Some older items might not be saved. Try deleting some rackets.");
    }
  }, [collection]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // 1. Resize and Convert to Base64
      const resizedBase64 = await resizeImage(file);
      const rawBase64 = resizedBase64.split(',')[1];
      const mimeType = 'image/jpeg'; // We converted to jpeg in resizeImage

      // 2. Call Gemini API
      const analysis = await analyzeRacketImage(rawBase64, mimeType);

      // 3. Create new Racket Object
      const newRacket: RacketData = {
        id: Date.now().toString(),
        brand: analysis.brand,
        model: analysis.model,
        description: analysis.description,
        stats: analysis.stats,
        originalImage: resizedBase64, // Store the resized version
        createdAt: Date.now()
      };

      // 4. Update State
      setCollection(prev => [newRacket, ...prev]);
      setSelectedRacket(newRacket);
      setView(AppView.DETAILS);

    } catch (error) {
      console.error("Analysis failed", error);
      alert("识别失败，请重试。请确保网络连接正常且图片清晰。\n" + (error instanceof Error ? error.message : ""));
    } finally {
      setIsAnalyzing(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-retro-bg p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(36,40,59,1),rgba(26,27,38,1))] -z-10" />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] -z-10" />

      <div className="mb-12 animate-pulse">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-retro-accent to-retro-pop tracking-tighter transform skew-x-[-10deg]">
          PIXEL<br/>SMASH
        </h1>
        <p className="text-retro-green font-mono mt-2 tracking-widest uppercase text-sm">羽毛球拍收藏家</p>
      </div>

      <div className="space-y-4 w-full max-w-xs z-10">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-retro-pop hover:bg-pink-600 text-white font-bold py-4 px-6 border-b-4 border-pink-800 active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          <Camera size={24} />
          扫描球拍
        </button>
        
        <button 
          onClick={() => setView(AppView.COLLECTION)}
          className="w-full bg-retro-card hover:bg-gray-700 text-retro-accent font-bold py-4 px-6 border-b-4 border-gray-900 active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
        >
          <Grid size={24} />
          我的收藏
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
        onChange={handleFileUpload}
      />
      
      <div className="absolute bottom-4 text-xs text-gray-600 font-mono">v1.0.2 | React + Gemini</div>
    </div>
  );

  const renderCollection = () => (
    <div className="min-h-screen bg-retro-bg p-4 pb-20">
      <header className="flex items-center justify-between mb-6 sticky top-0 bg-retro-bg/90 backdrop-blur-sm z-20 py-2 border-b border-gray-800">
        <button onClick={() => setView(AppView.HOME)} className="text-white p-2">
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold text-retro-accent tracking-wider">装备库</h2>
        <button onClick={() => fileInputRef.current?.click()} className="text-retro-pop p-2">
          <Plus />
        </button>
      </header>

      {collection.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <Zap size={48} className="mb-4 opacity-20" />
          <p>暂无收藏</p>
          <p className="text-sm mt-2">快去扫描你的第一把球拍！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.map(racket => (
            <div key={racket.id} className="transform hover:scale-[1.02] transition-transform duration-200">
               <RacketCard 
                 data={racket} 
                 onClick={() => {
                   setSelectedRacket(racket);
                   setView(AppView.DETAILS);
                 }}
               />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedRacket) return null;
    return (
      <div className="min-h-screen bg-retro-bg p-4 flex flex-col items-center justify-center relative">
        <button 
          onClick={() => setView(AppView.COLLECTION)} 
          className="absolute top-4 left-4 text-white bg-gray-800/50 p-2 rounded-full hover:bg-gray-700 z-20"
        >
          <ArrowLeft />
        </button>
        
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <span className="inline-block bg-retro-green text-black text-xs font-bold px-2 py-1 mb-2 transform skew-x-[-10deg]">
              ITEM ACQUIRED
            </span>
          </div>
          <RacketCard data={selectedRacket} detailed={true} />
          
          <button 
             onClick={() => {
               const confirmDelete = window.confirm("确定要删除这个收藏吗？");
               if(confirmDelete) {
                 setCollection(prev => prev.filter(r => r.id !== selectedRacket.id));
                 setView(AppView.COLLECTION);
               }
             }}
             className="mt-8 w-full text-red-500 text-sm font-mono hover:text-red-400"
          >
            [DELETE ARTIFACT]
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="fixed inset-0 z-50 bg-retro-bg flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-retro-pop border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-white animate-pulse">ANALYZING</h2>
      <p className="text-retro-accent font-mono mt-2">正在像素化...</p>
      
      <TypewriterLogs />
    </div>
  );

  return (
    <>
      {isAnalyzing && renderLoading()}
      
      {view === AppView.HOME && renderHome()}
      {view === AppView.COLLECTION && renderCollection()}
      {view === AppView.DETAILS && renderDetails()}
    </>
  );
};

export default App;