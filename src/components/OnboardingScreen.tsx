'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Target, 
  Calendar, 
  Trophy,
  Flame,
  BookOpen,
  Star,
  Zap,
  TrendingUp,
  X
} from 'lucide-react';

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

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

const focusAreaOptions = [
  'Arrays & Strings',
  'Linked Lists',
  'Trees & Graphs',
  'Dynamic Programming',
  'Recursion & Backtracking',
  'Sorting & Searching',
  'Stacks & Queues',
  'Hash Tables',
  'System Design',
  'Math & Bit Manipulation'
];

const aimOptions = [
  'FAANG Interview Preparation',
  'Product-Based Company',
  'Competitive Programming',
  'Placement Preparation',
  'Skill Enhancement',
  'Career Switch to Tech',
  'Software Engineering Role',
  'Data Structures Mastery'
];

export default function OnboardingScreen({ onComplete, existingProfile }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(
    existingProfile || {
      name: '',
      aim: '',
      targetDate: '',
      goals: {
        dailyProblems: 3,
        weeklyGoal: 20,
        focusAreas: []
      },
      createdAt: new Date().toISOString(),
      isOnboarded: false
    }
  );

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        onComplete(profile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const toggleFocusArea = (area: string) => {
    const updatedAreas = profile.goals.focusAreas.includes(area)
      ? profile.goals.focusAreas.filter(a => a !== area)
      : [...profile.goals.focusAreas, area];
    
    setProfile({
      ...profile,
      goals: { ...profile.goals, focusAreas: updatedAreas }
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return profile.name.trim().length > 0;
      case 2: return profile.aim.trim().length > 0;
      case 3: return profile.targetDate.length > 0;
      case 4: return profile.goals.focusAreas.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {existingProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(existingProfile)}
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {existingProfile ? 'Update Your Profile' : 'DSA Mastery Journey'}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {existingProfile 
              ? 'Update your goals and preferences to stay on track'
              : "Let&apos;s set up your personalized coding journey to achieve your goals"
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {step} of 4
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((step / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    What&apos;s your name?
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Let&apos;s start with the basics. We&apos;ll use this to personalize your experience.
                </p>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    What&apos;s your aim, {profile.name}?
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose your primary goal to help us tailor your learning path.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aimOptions.map((aim) => (
                    <Button
                      key={aim}
                      variant={profile.aim === aim ? "default" : "outline"}
                      onClick={() => setProfile({ ...profile, aim })}
                      className={`p-4 h-auto text-left justify-start ${
                        profile.aim === aim 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{aim}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    When do you want to achieve this?
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Setting a target date helps create urgency and track progress effectively.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={profile.targetDate}
                      onChange={(e) => setProfile({ ...profile, targetDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Problems Goal
                      </label>
                      <select
                        value={profile.goals.dailyProblems}
                        onChange={(e) => setProfile({
                          ...profile,
                          goals: { ...profile.goals, dailyProblems: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={1}>1 problem/day</option>
                        <option value={2}>2 problems/day</option>
                        <option value={3}>3 problems/day</option>
                        <option value={4}>4 problems/day</option>
                        <option value={5}>5 problems/day</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weekly Goal
                      </label>
                      <select
                        value={profile.goals.weeklyGoal}
                        onChange={(e) => setProfile({
                          ...profile,
                          goals: { ...profile.goals, weeklyGoal: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={10}>10 problems/week</option>
                        <option value={15}>15 problems/week</option>
                        <option value={20}>20 problems/week</option>
                        <option value={25}>25 problems/week</option>
                        <option value={30}>30 problems/week</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Choose your focus areas
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select the topics you want to focus on. You can change these later.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {focusAreaOptions.map((area) => (
                    <Button
                      key={area}
                      variant={profile.goals.focusAreas.includes(area) ? "default" : "outline"}
                      onClick={() => toggleFocusArea(area)}
                      className={`p-3 h-auto text-left justify-start ${
                        profile.goals.focusAreas.includes(area)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Selected {profile.goals.focusAreas.length} areas
                </p>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between items-center p-8 pt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6"
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-2 h-2 rounded-full ${
                    num <= step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                {existingProfile ? 'Update Profile' : 'Start Journey'}
              </Button>
            )}
          </div>
        </Card>

        {/* Motivational Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>Stay Consistent</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Practice Daily</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Track Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
