'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoLength, setVideoLength] = useState(97);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMemories, setSavedMemories] = useState<Array<{
    id: string;
    videoUrl: string;
    prompt: string;
    imageUrl: string;
    createdAt: Date;
  }>>([]);
  const [showGallery, setShowGallery] = useState(false);

  // Load saved memories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('memory-maker-videos');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedMemories(parsed.map((m: {
        id: string;
        videoUrl: string;
        prompt: string;
        imageUrl: string;
        createdAt: string | Date;
      }) => ({
        ...m,
        createdAt: new Date(m.createdAt)
      })));
    }
  }, []);

  // Save memory to localStorage and state
  const saveMemory = (videoUrl: string) => {
    if (!selectedImage || !storyPrompt || !imagePreview) return;
    
    const newMemory = {
      id: Date.now().toString(),
      videoUrl,
      prompt: storyPrompt,
      imageUrl: imagePreview,
      createdAt: new Date()
    };
    
    const updatedMemories = [newMemory, ...savedMemories];
    setSavedMemories(updatedMemories);
    localStorage.setItem('memory-maker-videos', JSON.stringify(updatedMemories));
  };

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImage || !storyPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: storyPrompt,
          image: imageBase64,
          aspectRatio,
          videoLength,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      setGeneratedVideo(data.videoUrl);
      saveMemory(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white">
              Memory Maker
            </h1>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 border border-gray-200 dark:border-slate-600 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {showGallery ? 'Create Memory' : `Gallery (${savedMemories.length})`}
            </button>
          </div>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Transform your cherished photos into living memories. Upload a photo and describe what happened next.
          </p>
        </div>

        {/* Gallery View */}
        {showGallery ? (
          <div className="max-w-6xl mx-auto">
            {savedMemories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 text-slate-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No memories yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Create your first memory video to see it here
                </p>
                <button
                  onClick={() => setShowGallery(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg"
                >
                  Create Your First Memory
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                    Your Memory Collection
                  </h2>
                  <span className="text-slate-600 dark:text-slate-400">
                    {savedMemories.length} {savedMemories.length === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedMemories.map((memory) => (
                    <div key={memory.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="aspect-video relative bg-black">
                        <video
                          src={memory.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              setGeneratedVideo(memory.videoUrl);
                              setShowGallery(false);
                            }}
                            className="bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-full font-medium transition-colors"
                          >
                            View Full
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3 mb-2">
                          {memory.prompt}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {memory.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Upload Section */}
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Left Column - Photo Upload & Story */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Photo Upload */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      1. Choose Your Photo
                    </h2>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 bg-white dark:bg-slate-800 ${
                        isDragActive
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-300 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={() => setIsDragActive(false)}
                    >
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full max-w-sm mx-auto">
                            <Image
                              src={imagePreview}
                              alt="Selected memory"
                              width={300}
                              height={225}
                              className="rounded-lg shadow-md object-cover w-full"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 text-sm"
                          >
                            Choose a different photo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg text-gray-700 dark:text-slate-300 mb-1">
                              Upload your photo
                            </p>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">
                              Drag and drop or click to browse
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors text-sm shadow-md"
                          >
                            Choose Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Prompt */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      2. Tell Your Story
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="story-prompt" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          What happened next in this moment?
                        </label>
                        <textarea
                          id="story-prompt"
                          rows={4}
                          value={storyPrompt}
                          onChange={(e) => setStoryPrompt(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white resize-none"
                          placeholder="Describe what happened next in vivid detail..."
                        />
                      </div>
                      
                      {/* Example Prompts */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800">
                        <h3 className="text-xs font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                          ✨ Example Prompts
                        </h3>
                        <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                          <button 
                            onClick={() => setStoryPrompt("My daughter took her first wobbly steps across the living room, arms outstretched, with the biggest smile on her face")}
                            className="block w-full text-left p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors"
                          >
                            &ldquo;First steps across the living room...&rdquo;
                          </button>
                          <button 
                            onClick={() => setStoryPrompt("The birthday candles flickered as everyone sang happy birthday, and you could see the joy and surprise in their eyes")}
                            className="block w-full text-left p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors"
                          >
                            &ldquo;Birthday candles flickering as everyone sang...&rdquo;
                          </button>
                          <button 
                            onClick={() => setStoryPrompt("The waves crashed over us as we laughed and played in the ocean, feeling completely carefree and happy")}
                            className="block w-full text-left p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors"
                          >
                            &ldquo;Waves crashing as we played in the ocean...&rdquo;
                          </button>
                        </div>
                      </div>


                      {/* Generate Button */}
                      <button 
                        onClick={handleGenerateVideo}
                        disabled={!selectedImage || !storyPrompt.trim() || isGenerating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none"
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Creating your memory...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">✨</span>
                            Create Memory Video
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Video Result */}
                <div className="lg:col-span-3">
                  <div className="sticky top-8 space-y-8">
                    {/* Video Result */}
                    {generatedVideo && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 px-8 py-6 text-center border-b border-slate-100 dark:border-slate-700">
                          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            🎉 Your Memory Comes Alive!
                          </h2>
                          <p className="text-slate-600 dark:text-slate-300">
                            Your cherished moment has been transformed into a living memory
                          </p>
                        </div>
                        
                        <div className="p-8">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl ring-1 ring-slate-900/10">
                            <video
                              src={generatedVideo}
                              controls
                              autoPlay
                              loop
                              className="w-full h-full object-contain"
                            >
                              Your browser does not support video playback.
                            </video>
                          </div>
                          
                          <div className="flex gap-4 mt-8">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(generatedVideo);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `memory-video-${Date.now()}.mp4`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Download failed:', error);
                                  // Fallback to simple download
                                  const link = document.createElement('a');
                                  link.href = generatedVideo;
                                  link.download = `memory-video-${Date.now()}.mp4`;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Video
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setGeneratedVideo(null);
                                setSelectedImage(null);
                                setImagePreview(null);
                                setStoryPrompt('');
                              }}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 border border-slate-200 dark:border-slate-600"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Another
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Settings */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                      <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                          Video Settings
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Customize your video output
                        </p>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                              Aspect Ratio
                            </label>
                            <select
                              value={aspectRatio}
                              onChange={(e) => setAspectRatio(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            >
                              <option value="16:9">16:9 (Landscape)</option>
                              <option value="9:16">9:16 (Portrait)</option>
                              <option value="1:1">1:1 (Square)</option>
                            </select>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Choose the video dimensions
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                              Duration: {Math.round(videoLength / 24 * 10) / 10}s
                            </label>
                            <div className="relative">
                              <input
                                type="range"
                                min="49"
                                max="193"
                                value={videoLength}
                                onChange={(e) => setVideoLength(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 slider"
                                style={{
                                  background: `linear-gradient(to right, #059669 0%, #059669 ${((videoLength - 49) / (193 - 49)) * 100}%, #e2e8f0 ${((videoLength - 49) / (193 - 49)) * 100}%, #e2e8f0 100%)`
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>2s</span>
                              <span>8s</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Longer videos take more time to generate
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Placeholder when no video */}
                    {!generatedVideo && !isGenerating && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 m-8 rounded-xl min-h-[400px] flex flex-col justify-center items-center p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="w-24 h-24 mx-auto mb-6 text-slate-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Your memory video will appear here
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                            Upload a cherished photo and describe what happened next to bring your memory to life
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>Waiting for your input...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {isGenerating && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 px-8 py-6 text-center border-b border-slate-100 dark:border-slate-700">
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            ✨ Creating Your Memory...
                          </h2>
                          <p className="text-slate-600 dark:text-slate-300">
                            AI is bringing your story to life
                          </p>
                        </div>
                        
                        <div className="p-12 text-center min-h-[400px] flex flex-col justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
                          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Bringing your memory to life...
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 mb-6">
                            This usually takes 30-60 seconds
                          </p>
                          <div className="max-w-sm mx-auto">
                            <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Processing your request...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

        {/* Error Display */}
        {error && (
            <div className="max-w-4xl mx-auto mt-8">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error generating video: {error}</span>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p className="text-sm">
              Made with ❤️ by <span className="font-medium text-gray-900 dark:text-white">unicodeveloper</span> • Powered by <span className="font-medium text-emerald-600 dark:text-emerald-400">LTXV</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
