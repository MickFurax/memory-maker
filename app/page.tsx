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

  // Remove a single memory
  const removeMemory = (memoryId: string) => {
    const updatedMemories = savedMemories.filter(memory => memory.id !== memoryId);
    setSavedMemories(updatedMemories);
    localStorage.setItem('memory-maker-videos', JSON.stringify(updatedMemories));
  };

  // Clear all memories
  const clearAllMemories = () => {
    setSavedMemories([]);
    localStorage.removeItem('memory-maker-videos');
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
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white">
              Memory Maker
            </h1>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 border border-gray-200 dark:border-slate-600 shadow-sm text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="hidden xs:inline">{showGallery ? 'Create Memory' : `Gallery (${savedMemories.length})`}</span>
              <span className="xs:hidden">{showGallery ? 'Create' : `Gallery`}</span>
            </button>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto px-2">
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                    Your Memory Collection
                  </h2>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      {savedMemories.length} {savedMemories.length === 1 ? 'memory' : 'memories'}
                    </span>
                    <button
                      onClick={clearAllMemories}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm shadow-md flex items-center gap-1 sm:gap-2"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden xs:inline">Clear All</span>
                      <span className="xs:hidden">Clear</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {savedMemories.map((memory) => (
                    <div key={memory.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative group">
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
                        {/* Mobile: Always visible buttons, Desktop: Hover overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3 p-2">
                          <button
                            onClick={() => {
                              setGeneratedVideo(memory.videoUrl);
                              setShowGallery(false);
                            }}
                            className="bg-white/90 hover:bg-white text-slate-800 px-3 sm:px-4 py-2 rounded-full font-medium transition-colors text-xs sm:text-sm flex-1 sm:flex-none min-w-0"
                          >
                            <span className="hidden xs:inline">View Full</span>
                            <span className="xs:hidden">View</span>
                          </button>
                          <button
                            onClick={() => removeMemory(memory.id)}
                            className="bg-red-500/90 hover:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none min-w-0"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden xs:inline">Remove</span>
                            <span className="xs:hidden">Del</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-2">
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
              <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column - Photo Upload & Story */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Photo Upload */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      1. Choose Your Photo
                    </h2>
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 bg-white dark:bg-slate-800 ${
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
                          <div className="relative w-full max-w-xs sm:max-w-sm mx-auto">
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
                            className="text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 text-sm touch-manipulation"
                          >
                            Choose a different photo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-base sm:text-lg text-gray-700 dark:text-slate-300 mb-1">
                              Upload your photo
                            </p>
                            <p className="text-gray-500 dark:text-slate-400 text-sm px-2">
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
                            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors text-sm sm:text-base shadow-md touch-manipulation"
                          >
                            Choose Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Prompt */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
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
                          className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white resize-none touch-manipulation"
                          placeholder="Describe what happened next in vivid detail..."
                        />
                      </div>
                      
                      {/* Example Prompts */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4 border border-emerald-100 dark:border-emerald-800">
                        <h3 className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2 sm:mb-3">
                          ✨ Example Prompts
                        </h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                          <button 
                            onClick={() => setStoryPrompt("My daughter took her first wobbly steps across the living room, arms outstretched, with the biggest smile on her face")}
                            className="block w-full text-left p-2 sm:p-2.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors touch-manipulation"
                          >
                            &ldquo;First steps across the living room...&rdquo;
                          </button>
                          <button 
                            onClick={() => setStoryPrompt("The birthday candles flickered as everyone sang happy birthday, and you could see the joy and surprise in their eyes")}
                            className="block w-full text-left p-2 sm:p-2.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors touch-manipulation"
                          >
                            &ldquo;Birthday candles flickering as everyone sang...&rdquo;
                          </button>
                          <button 
                            onClick={() => setStoryPrompt("The creature from the image starts to move")}
                            className="block w-full text-left p-2 sm:p-2.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors touch-manipulation"
                          >
                            &ldquo;The creature from the image starts to move...&rdquo;
                          </button>
                        </div>
                      </div>


                      {/* Generate Button */}
                      <button 
                        onClick={handleGenerateVideo}
                        disabled={!selectedImage || !storyPrompt.trim() || isGenerating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 sm:py-5 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none touch-manipulation"
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span className="hidden xs:inline">Creating your memory...</span>
                            <span className="xs:hidden">Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg sm:text-xl">✨</span>
                            <span className="hidden sm:inline">Create Memory Video</span>
                            <span className="sm:hidden">Create Memory</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* Video Result */}
                    {generatedVideo && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center border-b border-slate-100 dark:border-slate-700">
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            🎉 Your Memory Comes Alive!
                          </h2>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 px-2">
                            Your cherished moment has been transformed into a living memory
                          </p>
                        </div>
                        
                        <div className="p-4 sm:p-6 lg:p-8">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl ring-1 ring-slate-900/10">
                            <video
                              src={generatedVideo}
                              controls
                              autoPlay
                              loop
                              playsInline
                              className="w-full h-full object-contain"
                            >
                              Your browser does not support video playback.
                            </video>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
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
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-manipulation text-sm sm:text-base"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="hidden xs:inline">Download Video</span>
                                <span className="xs:hidden">Download</span>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setGeneratedVideo(null);
                                setSelectedImage(null);
                                setImagePreview(null);
                                setStoryPrompt('');
                              }}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 border border-slate-200 dark:border-slate-600 touch-manipulation text-sm sm:text-base"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="hidden xs:inline">Create Another</span>
                                <span className="xs:hidden">New</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Settings */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                      <div className="bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                          Video Settings
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Customize your video output
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                              Aspect Ratio
                            </label>
                            <select
                              value={aspectRatio}
                              onChange={(e) => setAspectRatio(e.target.value)}
                              className="w-full px-3 sm:px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base touch-manipulation"
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
                                className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 slider touch-manipulation"
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
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 m-4 sm:m-6 lg:m-8 rounded-xl min-h-[300px] sm:min-h-[400px] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 text-slate-400">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-3 px-2">
                            Your memory video will appear here
                          </h3>
                          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 sm:mb-6 px-4">
                            Upload a cherished photo and describe what happened next to bring your memory to life
                          </p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>Waiting for your input...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {isGenerating && (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center border-b border-slate-100 dark:border-slate-700">
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            ✨ Creating Your Memory...
                          </h2>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 px-2">
                            AI is bringing your story to life
                          </p>
                        </div>
                        
                        <div className="p-6 sm:p-8 lg:p-12 text-center min-h-[300px] sm:min-h-[400px] flex flex-col justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-orange-500 mx-auto mb-4 sm:mb-6"></div>
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3 px-2">
                            Bringing your memory to life...
                          </h3>
                          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 px-4">
                            This usually takes 30-60 seconds
                          </p>
                          <div className="max-w-xs sm:max-w-sm mx-auto px-4">
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
            <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-2 sm:gap-3 text-red-800 dark:text-red-200">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-sm sm:text-base">Error generating video: {error}</span>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p className="text-xs sm:text-sm px-2">
              Made with ❤️ by <span className="font-medium text-gray-900 dark:text-white"><a href="https://twitter.com/unicodeveloper" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">unicodeveloper</a></span> • Powered by <span className="font-medium text-emerald-600 dark:text-emerald-400"><a href="https://github.com/Lightricks/LTX-Video" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">LTXV</a></span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
