'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Target, 
  Flame, 
  Trophy,
  CheckCircle2,
  RotateCcw,
  StickyNote,
  ExternalLink,
  Code,
  ChevronDown,
  ChevronUp,
  Calendar,
  Settings,
  Download,
  Upload,
  X
} from 'lucide-react';

// Import unified types and utilities
import { 
  UnifiedSheet, 
  SHEET_CONFIGS, 
  DifficultyFilter, 
  RevisionFilter 
} from '@/types/sheets';
import { 
  loadSheetData, 
  getAllTopics, 
  filterTopics, 
  getDifficultyLabel, 
  getDifficultyColor, 
  calculateProgress 
} from '@/utils/sheetLoader';
import OnboardingScreen from '@/components/OnboardingScreen';

export interface UserProfile {
  name: string;
  aim: string;
  targetDate: string;
  goals: {
    dailyProblems: number;
    weeklyGoal: number;
    focusAreas: string[];
  };
  createdAt: string;
  isOnboarded: boolean;
}

export default function Home() {
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // State for current sheet and data
  const [currentSheet, setCurrentSheet] = useState<string>('a2z');
  const [sheetData, setSheetData] = useState<UnifiedSheet>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User progress and preferences
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [revision, setRevision] = useState<Record<string, boolean>>({});
  
  // Filters and UI state
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [revisionFilter, setRevisionFilter] = useState<RevisionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentProblemId, setCurrentProblemId] = useState<string>('');
  const [currentNote, setCurrentNote] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  
  // UI state - table view is now default
  const [showSectionHeadings, setShowSectionHeadings] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Load sheet data when current sheet changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadSheetData(currentSheet);
        // Ensure data is always an array
        if (Array.isArray(data)) {
          setSheetData(data);
        } else {
          console.error('Invalid sheet data format:', data);
          setSheetData([]);
          setError('Invalid sheet data format');
        }
      } catch (err) {
        console.error('Error loading sheet:', err);
        setError('Failed to load sheet data');
        setSheetData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentSheet]);

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const profile = data.result;
          setUserProfile(profile);
          setShowOnboarding(!profile.isOnboarded);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setShowOnboarding(true);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/progress');
        if (response.ok) {
          const data = await response.json();
          const result = data.result || {};
          // Convert numbers to booleans
          const booleanResult: Record<string, boolean> = {};
          Object.keys(result).forEach(key => {
            booleanResult[key] = Boolean(result[key]);
          });
          setCompleted(booleanResult);
        }
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    };

    const loadNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.result || {});
        }
      } catch (err) {
        console.error('Error loading notes:', err);
      }
    };

    const loadRevision = async () => {
      try {
        const response = await fetch('/api/revision');
        if (response.ok) {
          const data = await response.json();
          const result = data.result || {};
          // Convert numbers to booleans
          const booleanResult: Record<string, boolean> = {};
          Object.keys(result).forEach(key => {
            booleanResult[key] = Boolean(result[key]);
          });
          setRevision(booleanResult);
        }
      } catch (err) {
        console.error('Error loading revision:', err);
      }
    };

    loadProgress();
    loadNotes();
    loadRevision();
  }, []);

  // Filter and paginate topics
  const filteredTopics = useMemo(() => {
    if (!sheetData || sheetData.length === 0) return [];
    const allTopics = getAllTopics(sheetData);
    return filterTopics(allTopics, {
      difficulty: difficultyFilter,
      search: searchQuery,
      revision: revisionFilter,
      completed: completed || {},
      revisionStatus: revision || {}
    });
  }, [sheetData, difficultyFilter, revisionFilter, searchQuery, completed, revision]);

  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageTopics = filteredTopics.slice(startIndex, endIndex);

  // Create grouped problems outside of render
  const groupedProblems = useMemo(() => {
    if (!showSectionHeadings || !filteredTopics || filteredTopics.length === 0) {
      return {};
    }
    
    const topics = filteredTopics.slice(startIndex, endIndex);
    
    return topics.reduce((acc, topic) => {
      const sectionKey = topic.step_title || 'Unknown Section';
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      acc[sectionKey].push(topic);
      return acc;
    }, {} as Record<string, typeof topics>);
  }, [filteredTopics, startIndex, endIndex, showSectionHeadings]);

  // Progress statistics
  const progressStats = useMemo(() => {
    if (!sheetData || sheetData.length === 0) {
      return {
        totalProblems: 0,
        completedProblems: 0,
        revisionProblems: 0,
        pendingProblems: 0,
        progressPercentage: 0,
        difficultyStats: {
          easy: { total: 0, completed: 0 },
          medium: { total: 0, completed: 0 },
          hard: { total: 0, completed: 0 },
        }
      };
    }
    return calculateProgress(sheetData, completed || {}, revision || {});
  }, [sheetData, completed, revision]);

  // Toggle problem completion
  const toggleProblem = async (problemId: string) => {
    const newCompleted = { ...completed, [problemId]: !completed[problemId] };
    setCompleted(newCompleted);
    
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompleted),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Toggle revision status
  const toggleRevision = async (problemId: string) => {
    const newRevision = { ...revision, [problemId]: !revision[problemId] };
    setRevision(newRevision);
    
    try {
      await fetch('/api/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRevision),
      });
    } catch (err) {
      console.error('Error saving revision:', err);
    }
  };

  // Notes modal functions
  const openNotesModal = (problemId: string) => {
    setCurrentProblemId(problemId);
    setCurrentNote(notes[problemId] || '');
    setShowNotesModal(true);
  };

  const saveNote = async () => {
    const newNotes = { ...notes, [currentProblemId]: currentNote };
    setNotes(newNotes);
    setShowNotesModal(false);
    
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotes),
      });
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.length === 1 ? [1] : rangeWithDots;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDifficultyFilter('all');
    setRevisionFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Toggle section collapse
  const toggleSectionCollapse = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  // Export user data as ZIP
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsa-tracker-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Import user data from ZIP
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMessage(null);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/backup', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import data');
      }

      setImportMessage(result.message);
      
      // Refresh the page to load the imported data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setImportMessage(error instanceof Error ? error.message : 'Failed to import data. Please try again.');
    } finally {
      setImportLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Show onboarding if user has not completed it
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} existingProfile={userProfile} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading DSA Problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">Error Loading Data</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with motivational banner */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl shadow-lg">
                <Code className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {userProfile?.name ? `Welcome back, ${userProfile.name}!` : 'DSA Practice Tracker'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userProfile?.aim || 'Master Data Structures & Algorithms with TakeUForward'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Goals Info */}
              {userProfile && (
                <div className="hidden lg:flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Target className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300">
                      Goal: {userProfile.goals.dailyProblems}/day
                    </span>
                  </div>
                  {userProfile.targetDate && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Calendar className="w-3 h-3 text-green-600" />
                      <span className="text-green-700 dark:text-green-300">
                        Target: {new Date(userProfile.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOnboarding(true)}
                    className="text-xs"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </Button>
                </div>
              )}

              {/* Sheet selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sheet:
                </label>
              <select
                value={currentSheet}
                onChange={(e) => {
                  setCurrentSheet(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[180px]"
              >
                {SHEET_CONFIGS.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Stats Banner */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{progressStats.completedProblems}</div>
              <div className="text-sm opacity-90">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progressStats.totalProblems}</div>
              <div className="text-sm opacity-90">Total Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progressStats.progressPercentage}%</div>
              <div className="text-sm opacity-90">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progressStats.revisionProblems}</div>
              <div className="text-sm opacity-90">In Revision</div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Goals Section */}
      {userProfile && userProfile.isOnboarded && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Keep the momentum going, {userProfile.name}! 🚀
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aim: {userProfile.aim} | Target: {userProfile.targetDate ? new Date(userProfile.targetDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {userProfile.goals.dailyProblems}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Daily Goal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">
                      {userProfile.goals.weeklyGoal}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Weekly Goal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {userProfile.goals.focusAreas.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Focus Areas</div>
                  </div>
                </div>
              </div>
              
              {/* Daily Progress Bar */}
              <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Today&apos;s Progress
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.min(progressStats.completedProblems, userProfile.goals.dailyProblems)}/{userProfile.goals.dailyProblems} problems
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((progressStats.completedProblems / userProfile.goals.dailyProblems) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              
              {userProfile.goals.focusAreas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Areas:</span>
                    {userProfile.goals.focusAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Filters Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search problems, topics, or concepts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                  >
                    ✕
                  </Button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="space-y-4">
                {/* Main Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={revisionFilter}
                      onChange={(e) => setRevisionFilter(e.target.value as RevisionFilter)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">✅ Completed</option>
                      <option value="pending">⭕ Pending</option>
                      <option value="revision">🔄 In Revision</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      View
                    </label>
                    <div className="flex gap-2 h-10">
                      <Button
                        variant={showSectionHeadings ? "default" : "outline"}
                        onClick={() => setShowSectionHeadings(!showSectionHeadings)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 h-full px-3 text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Grouped</span>
                      </Button>
                      
                      {showSectionHeadings && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setCollapsedSections({})}
                            className="flex items-center gap-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 h-full px-2 text-sm"
                          >
                            <ChevronDown className="w-3 h-3" />
                            <span className="hidden lg:inline">Expand</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const allSections = Object.keys(groupedProblems);
                              const collapsed = allSections.reduce((acc, section) => {
                                acc[section] = true;
                                return acc;
                              }, {} as Record<string, boolean>);
                              setCollapsedSections(collapsed);
                            }}
                            className="flex items-center gap-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 h-full px-2 text-sm"
                          >
                            <ChevronUp className="w-3 h-3" />
                            <span className="hidden lg:inline">Collapse</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Quick Filters:</span>
                  <Button size="sm" variant="outline" onClick={() => { setDifficultyFilter('easy'); setCurrentPage(1); }}>
                    🟢 Easy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDifficultyFilter('medium'); setCurrentPage(1); }}>
                    🟡 Medium
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDifficultyFilter('hard'); setCurrentPage(1); }}>
                    🔴 Hard
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRevisionFilter('completed'); setCurrentPage(1); }}>
                    ✅ Completed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRevisionFilter('pending'); setCurrentPage(1); }}>
                    ⭕ Unsolved
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRevisionFilter('revision'); setCurrentPage(1); }}>
                    🔄 Need Review
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
          </div>
          </CardContent>
        </Card>

        {/* Problems Table */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                {SHEET_CONFIGS.find(c => c.id === currentSheet)?.name || 'DSA Problems'}
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {filteredTopics.length} problems
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                  <Search className="w-full h-full text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No problems found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try adjusting your search filters to find more problems.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {showSectionHeadings ? (
                  Object.entries(groupedProblems).map(([sectionTitle, problems]) => (
                      <div key={sectionTitle} className="space-y-3">
                        {/* Section Header */}
                        <div 
                          className="sticky top-16 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md cursor-pointer section-header transition-all duration-200"
                          onClick={() => toggleSectionCollapse(sectionTitle)}
                        >
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            {sectionTitle}
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 ml-2">
                              {problems.length} problems
                            </Badge>
                            <div className="ml-auto">
                              <ChevronDown className={`w-5 h-5 chevron-rotate ${collapsedSections[sectionTitle] ? '' : 'collapsed'}`} />
                            </div>
                          </h3>
                        </div>
                        
                        {/* Problems Table */}
                        {!collapsedSections[sectionTitle] && (
                          <div className="section-content overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">#</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Problem</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Difficulty</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Links</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {problems.map((topic) => {
                                const globalIndex = startIndex + currentPageTopics.findIndex(t => t.id === topic.id);
                                return (
                                  <tr 
                                    key={topic.id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                      completed[topic.id] ? 'bg-green-50/50 dark:bg-green-900/10' :
                                      revision[topic.id] ? 'bg-yellow-50/50 dark:bg-yellow-900/10' :
                                      notes[topic.id] ? 'has-notes-row' : ''
                                    }`}
                                  >
                                    {/* Serial Number */}
                                    <td className="px-3 py-2">
                                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                                        {globalIndex + 1}
                                      </div>
                                    </td>
                                    
                                    {/* Problem Name and Notes */}
                                    <td className="px-3 py-2">
                                      <div className="space-y-1">
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white leading-tight">
                                          {topic.question_title}
                                        </h3>
                                        {notes[topic.id] && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <div className="notes-indicator">
                                              📝
                                            </div>
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">Has notes</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Difficulty */}
                                    <td className="px-3 py-2">
                                      <Badge 
                                        variant="outline" 
                                        className={`${getDifficultyColor(topic.difficulty)} border-0 text-xs`}
                                      >
                                        {getDifficultyLabel(topic.difficulty)}
                                      </Badge>
                                    </td>
                                    
                                    {/* Status */}
                                    <td className="px-3 py-2">
                                      <div className="flex flex-col gap-1">
                                        {completed[topic.id] && (
                                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-xs">
                                            ✅ Done
                                          </Badge>
                                        )}
                                        {revision[topic.id] && (
                                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-xs">
                                            🔄 Review
                                          </Badge>
                                        )}
                                        {!completed[topic.id] && !revision[topic.id] && (
                                          <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
                                            ⭕ Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Links */}
                                    <td className="px-3 py-2">
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {topic.lc_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.lc_link, '_blank')}
                                            className="h-5 w-7 p-0 border-gray-300 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 text-xs"
                                            title="LeetCode"
                                          >
                                            LC
                                          </Button>
                                        )}
                                        {topic.gfg_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.gfg_link, '_blank')}
                                            className="h-5 w-8 p-0 border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-600 text-xs"
                                            title="GeeksforGeeks"
                                          >
                                            GFG
                                          </Button>
                                        )}
                                        {topic.cs_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.cs_link, '_blank')}
                                            className="h-5 w-7 p-0 border-gray-300 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-600 text-xs"
                                            title="Coding Ninjas"
                                          >
                                            CN
                                          </Button>
                                        )}
                                        {topic.post_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.post_link, '_blank')}
                                            className="h-5 w-6 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500 text-xs"
                                            title="Article"
                                          >
                                            📄
                                          </Button>
                                        )}
                                        {topic.yt_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.yt_link, '_blank')}
                                            className="h-5 w-6 p-0 border-gray-300 hover:bg-red-50 hover:border-red-500 text-xs"
                                            title="YouTube"
                                          >
                                            🎬
                                          </Button>
                                        )}
                                        {topic.editorial_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.editorial_link, '_blank')}
                                            className="h-5 w-6 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500 text-xs"
                                            title="Editorial"
                                          >
                                            📖
                                          </Button>
                                        )}
                                        {topic.plus_link && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(topic.plus_link, '_blank')}
                                            className="h-5 w-7 p-0 border-gray-300 hover:bg-emerald-50 hover:border-emerald-500 text-xs"
                                            title="TUF Plus"
                                          >
                                            T+
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1 justify-center">
                                        <Button
                                          size="sm"
                                          variant={completed[topic.id] ? "default" : "outline"}
                                          onClick={() => toggleProblem(topic.id)}
                                          className={`h-5 w-5 p-0 ${completed[topic.id] 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "border-gray-300 hover:bg-green-50 hover:border-green-500"
                                          }`}
                                          title={completed[topic.id] ? "Mark as pending" : "Mark as completed"}
                                        >
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={revision[topic.id] ? "default" : "outline"}
                                          onClick={() => toggleRevision(topic.id)}
                                          className={`h-5 w-5 p-0 ${revision[topic.id] 
                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                                            : "border-gray-300 hover:bg-yellow-50 hover:border-yellow-500"
                                          }`}
                                          title={revision[topic.id] ? "Remove from revision" : "Add to revision"}
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => openNotesModal(topic.id)}
                                          className="h-5 w-5 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                                          title="Add notes"
                                        >
                                          <StickyNote className="w-2.5 h-2.5" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">#</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Problem</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Section</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Difficulty</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Links</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentPageTopics.map((topic, index) => (
                          <tr 
                            key={topic.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                              completed[topic.id] ? 'bg-green-50/50 dark:bg-green-900/10' :
                              revision[topic.id] ? 'bg-yellow-50/50 dark:bg-yellow-900/10' :
                              notes[topic.id] ? 'has-notes-row' : ''
                            }`}
                          >
                            {/* Serial Number */}
                            <td className="px-2 py-1">
                              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                                {startIndex + index + 1}
                              </div>
                            </td>
                            
                            {/* Problem Name and Notes */}
                            <td className="px-2 py-1">
                              <div className="space-y-1">
                                <h3 className="font-medium text-xs text-gray-900 dark:text-white leading-tight">
                                  {topic.question_title}
                                </h3>
                                {notes[topic.id] && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <div className="notes-indicator" style={{width: '12px', height: '12px', fontSize: '6px'}}>
                                      📝
                                    </div>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Notes</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Section */}
                            <td className="px-2 py-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {topic.step_title}
                              </span>
                            </td>
                            
                            {/* Difficulty */}
                            <td className="px-2 py-1">
                              <Badge 
                                variant="outline" 
                                className={`${getDifficultyColor(topic.difficulty)} border-0 text-xs px-1 py-0`}
                              >
                                {getDifficultyLabel(topic.difficulty)}
                              </Badge>
                            </td>
                            
                            {/* Status */}
                            <td className="px-2 py-1">
                              <div className="flex flex-col gap-1">
                                {completed[topic.id] && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-xs px-1 py-0">
                                    ✅ Done
                                  </Badge>
                                )}
                                {revision[topic.id] && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-xs px-1 py-0">
                                    🔄 Review
                                  </Badge>
                                )}
                                {!completed[topic.id] && !revision[topic.id] && (
                                  <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs px-1 py-0">
                                    ⭕ Pending
                                  </Badge>
                                )}
                              </div>
                            </td>
                            
                            {/* Links */}
                            <td className="px-2 py-1">
                              <div className="flex flex-wrap gap-0.5 justify-center">
                                {topic.lc_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.lc_link, '_blank')}
                                    className="h-4 w-6 p-0 border-gray-300 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 text-xs"
                                    title="LeetCode"
                                  >
                                    LC
                                  </Button>
                                )}
                                {topic.gfg_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.gfg_link, '_blank')}
                                    className="h-4 w-7 p-0 border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-600 text-xs"
                                    title="GeeksforGeeks"
                                  >
                                    GFG
                                  </Button>
                                )}
                                {topic.cs_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.cs_link, '_blank')}
                                    className="h-4 w-6 p-0 border-gray-300 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-600 text-xs"
                                    title="Coding Ninjas"
                                  >
                                    CN
                                  </Button>
                                )}
                                {topic.post_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.post_link, '_blank')}
                                    className="h-4 w-5 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500 text-xs"
                                    title="Article"
                                  >
                                    📄
                                  </Button>
                                )}
                                {topic.yt_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.yt_link, '_blank')}
                                    className="h-4 w-5 p-0 border-gray-300 hover:bg-red-50 hover:border-red-500 text-xs"
                                    title="YouTube"
                                  >
                                    🎬
                                  </Button>
                                )}
                                {topic.editorial_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.editorial_link, '_blank')}
                                    className="h-4 w-5 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500 text-xs"
                                    title="Editorial"
                                  >
                                    📖
                                  </Button>
                                )}
                                {topic.plus_link && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(topic.plus_link, '_blank')}
                                    className="h-4 w-6 p-0 border-gray-300 hover:bg-emerald-50 hover:border-emerald-500 text-xs"
                                    title="TUF Plus"
                                  >
                                    T+
                                  </Button>
                                )}
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-2 py-1">
                              <div className="flex gap-0.5 justify-center">
                                <Button
                                  size="sm"
                                  variant={completed[topic.id] ? "default" : "outline"}
                                  onClick={() => toggleProblem(topic.id)}
                                  className={`h-4 w-4 p-0 ${completed[topic.id] 
                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                    : "border-gray-300 hover:bg-green-50 hover:border-green-500"
                                  }`}
                                  title={completed[topic.id] ? "Mark as pending" : "Mark as completed"}
                                >
                                  <CheckCircle2 className="w-2 h-2" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={revision[topic.id] ? "default" : "outline"}
                                  onClick={() => toggleRevision(topic.id)}
                                  className={`h-4 w-4 p-0 ${revision[topic.id] 
                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                                    : "border-gray-300 hover:bg-yellow-50 hover:border-yellow-500"
                                  }`}
                                  title={revision[topic.id] ? "Remove from revision" : "Add to revision"}
                                >
                                  <RotateCcw className="w-2 h-2" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openNotesModal(topic.id)}
                                  className="h-4 w-4 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                                  title="Add notes"
                                >
                                  <StickyNote className="w-2 h-2" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTopics.length)} of {filteredTopics.length} problems
                </div>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <div className="flex gap-1">
                    {getPaginationRange().map((page, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        disabled={page === '...'}
                        className={
                          page === currentPage
                            ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[40px]"
                            : page === '...'
                            ? "border-0 cursor-default min-w-[40px]"
                            : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 min-w-[40px]"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" />
                Add Your Notes
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesModal(false)}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Write your notes, insights, or approach here..."
                className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              />
              <div className="flex gap-3">
                <Button
                  onClick={saveNote}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all hover:scale-105"
                >
                  <StickyNote className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNotesModal(false)}
                  className="px-6 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Export Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download your progress, notes, and settings as a backup file.
                  </p>
                  <Button
                    onClick={handleExportData}
                    disabled={exportLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    {exportLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>

                {/* Import Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Import Data
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Restore your data from a previously exported backup file.
                  </p>
                  
                  {importMessage && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${
                      importMessage.includes('successfully') 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {importMessage}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleImportData}
                      disabled={importLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      id="import-file"
                    />
                    <Button
                      asChild
                      disabled={importLoading}
                      variant="outline"
                      className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                    >
                      <label htmlFor="import-file" className="cursor-pointer">
                        {importLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Backup File (.zip)
                          </>
                        )}
                      </label>
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Only upload backup files created by this app. Importing will overwrite your current data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Stats Circle */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressStats.progressPercentage / 100)}`}
              className="text-blue-600 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {progressStats.progressPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
