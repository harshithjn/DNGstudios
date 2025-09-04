import React, { useState } from 'react';
import { ArrowLeft, Music2, Edit3, Check, X, User, LogOut } from 'lucide-react';
import type { ScorePage } from '../hooks/useSupabase';
import ModeSelector, { type ScoreMode } from './ModeSelector';

interface ProjectHeaderProps {
  project: ScorePage;
  onTitleChange: (title: string) => void;
  onBackToHome: () => void;
  onLogout: () => void;
  scoreMode: ScoreMode;
  onScoreModeChange: (mode: ScoreMode) => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onTitleChange,
  onBackToHome,
  onLogout,
  scoreMode,
  onScoreModeChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(project.title);
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Studio</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Music2 className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex items-center gap-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl font-semibold text-white bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSubmit();
                        if (e.key === 'Escape') handleTitleCancel();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleTitleSubmit}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-white">{project.title}</h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{project.composer || 'Unknown Composer'}</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.projectType === 'DNR' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {project.projectType || 'DNG'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ModeSelector 
              currentMode={scoreMode} 
              onModeChange={onScoreModeChange} 
            />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;