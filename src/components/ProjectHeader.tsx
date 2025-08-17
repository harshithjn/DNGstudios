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
  onBackToLanding?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onTitleChange,
  onBackToHome,
  onLogout,
  scoreMode,
  onScoreModeChange,
  onBackToLanding,
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
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Studio</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Music2 className="w-10 h-10 text-purple-400" />
                
              </div>
              <div className="flex items-center gap-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-2xl font-bold text-white bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSubmit();
                        if (e.key === 'Escape') handleTitleCancel();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleTitleSubmit}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{project.composer || 'Unknown Composer'}</span>
              </div>
              <span>•</span>
              <span>{project.notes.length} note{project.notes.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.projectType === 'DNR' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
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
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Landing</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
            <div className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              DNG Studios
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;