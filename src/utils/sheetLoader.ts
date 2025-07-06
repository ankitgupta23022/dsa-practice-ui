import { 
  A2ZSheet, 
  GeneralSheet, 
  UnifiedSheet, 
  UnifiedTopic,
  SHEET_CONFIGS
} from '@/types/sheets';

// Convert A2Z sheet format to unified format
function convertA2ZToUnified(a2zData: A2ZSheet): UnifiedSheet {
  return a2zData.map(step => ({
    step_no: step.step_no,
    step_title: step.step_title,
    sub_steps: step.sub_steps.map(subStep => ({
      sub_step_no: subStep.sub_step_no,
      sub_step_title: subStep.sub_step_title,
      topics: subStep.topics.map(topic => ({
        id: topic.id,
        step_no: topic.step_no,
        sub_step_no: topic.sub_step_no,
        sl_no: topic.sl_no,
        step_title: topic.step_title,
        sub_step_title: topic.sub_step_title,
        question_title: topic.question_title,
        post_link: topic.post_link,
        yt_link: topic.yt_link,
        editorial_link: topic.editorial_link,
        lc_link: topic.lc_link,
        plus_link: topic.plus_link,
        difficulty: topic.difficulty,
        ques_topic: topic.ques_topic,
      }))
    }))
  }));
}

// Convert general sheet format (Blind75, SDE, Striver79) to unified format
function convertGeneralToUnified(generalData: GeneralSheet): UnifiedSheet {
  return generalData.sheetData.map(step => ({
    step_no: step.step_no,
    step_title: step.head_step_no,
    sub_steps: [{
      sub_step_no: 1,
      sub_step_title: step.head_step_no,
      topics: step.topics.map(topic => ({
        id: topic.id,
        step_no: topic.step_no,
        sub_step_no: 1, // General sheets don't have sub_steps, so we use 1
        sl_no: topic.sl_no_in_step,
        step_title: topic.head_step_no,
        sub_step_title: topic.head_step_no,
        question_title: topic.title,
        post_link: topic.post_link,
        yt_link: topic.yt_link,
        editorial_link: topic.editorial_link,
        lc_link: topic.lc_link,
        plus_link: topic.plus_link,
        cs_link: topic.cs_link,
        gfg_link: topic.gfg_link,
        difficulty: topic.difficulty,
        ques_topic: topic.ques_topic,
        company_tags: topic.company_tags,
      }))
    }]
  }));
}

// Load and convert sheet data to unified format
export async function loadSheetData(sheetId: string): Promise<UnifiedSheet> {
  const config = SHEET_CONFIGS.find(c => c.id === sheetId);
  if (!config) {
    throw new Error(`Unknown sheet ID: ${sheetId}`);
  }

  try {
    const response = await fetch(`/api/sheets?sheet=${sheetId}`);
    if (!response.ok) {
      throw new Error(`Failed to load sheet ${sheetId}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load sheet data');
    }

    const data = result.data;

    // Convert based on sheet type
    if (sheetId === 'a2z') {
      return convertA2ZToUnified(data as A2ZSheet);
    } else {
      return convertGeneralToUnified(data as GeneralSheet);
    }
  } catch (error) {
    console.error(`Error loading sheet ${sheetId}:`, error);
    throw error;
  }
}

// Get all topics from a unified sheet as a flat array
export function getAllTopics(sheetData: UnifiedSheet): UnifiedTopic[] {
  const allTopics: UnifiedTopic[] = [];
  
  // Ensure sheetData is an array
  if (!Array.isArray(sheetData)) {
    console.warn('getAllTopics received non-array data:', sheetData);
    return allTopics;
  }
  
  sheetData.forEach(step => {
    if (step && step.sub_steps && Array.isArray(step.sub_steps)) {
      step.sub_steps.forEach(subStep => {
        if (subStep && subStep.topics && Array.isArray(subStep.topics)) {
          allTopics.push(...subStep.topics);
        }
      });
    }
  });
  
  return allTopics;
}

// Filter topics based on criteria
export function filterTopics(
  topics: UnifiedTopic[],
  {
    difficulty,
    search,
    revision,
    completed,
    revisionStatus
  }: {
    difficulty: string;
    search: string;
    revision: string;
    completed: Record<string, boolean>;
    revisionStatus: Record<string, boolean>;
  }
): UnifiedTopic[] {
  return topics.filter(topic => {
    // Difficulty filter
    if (difficulty !== 'all') {
      const topicDifficulty = getDifficultyLabel(topic.difficulty);
      if (topicDifficulty.toLowerCase() !== difficulty) {
        return false;
      }
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const searchableText = [
        topic.question_title,
        topic.step_title,
        topic.sub_step_title,
        topic.ques_topic || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Revision status filter
    if (revision !== 'all') {
      const isCompleted = completed[topic.id] || false;
      const inRevision = revisionStatus[topic.id] || false;

      switch (revision) {
        case 'completed':
          return isCompleted;
        case 'pending':
          return !isCompleted;
        case 'revision':
          return inRevision;
        default:
          return true;
      }
    }

    return true;
  });
}

// Get difficulty label from numeric value
export function getDifficultyLabel(difficulty?: number): string {
  if (difficulty === 0) return 'Easy';
  if (difficulty === 1) return 'Medium';
  if (difficulty === 2) return 'Hard';
  return 'Unknown';
}

// Get difficulty color for UI
export function getDifficultyColor(difficulty?: number): string {
  if (difficulty === 0) return 'text-green-600';
  if (difficulty === 1) return 'text-yellow-600';
  if (difficulty === 2) return 'text-red-600';
  return 'text-gray-600';
}

// Calculate progress statistics
export function calculateProgress(
  sheetData: UnifiedSheet,
  completed: Record<string, boolean>,
  revisionStatus: Record<string, boolean>
) {
  // Ensure we have valid data
  if (!sheetData || !Array.isArray(sheetData)) {
    console.warn('calculateProgress received invalid sheetData:', sheetData);
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

  const allTopics = getAllTopics(sheetData);
  const totalProblems = allTopics.length;
  const completedProblems = allTopics.filter(topic => completed[topic.id]).length;
  const revisionProblems = allTopics.filter(topic => revisionStatus[topic.id]).length;
  const pendingProblems = totalProblems - completedProblems;
  
  const progressPercentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
  
  // Calculate difficulty-wise progress
  const difficultyStats = {
    easy: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    hard: { total: 0, completed: 0 },
  };
  
  allTopics.forEach(topic => {
    const difficultyKey = getDifficultyLabel(topic.difficulty).toLowerCase() as keyof typeof difficultyStats;
    if (difficultyStats[difficultyKey]) {
      difficultyStats[difficultyKey].total++;
      if (completed[topic.id]) {
        difficultyStats[difficultyKey].completed++;
      }
    }
  });

  return {
    totalProblems,
    completedProblems,
    revisionProblems,
    pendingProblems,
    progressPercentage,
    difficultyStats,
  };
}
