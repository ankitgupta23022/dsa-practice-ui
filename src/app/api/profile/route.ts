import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PROFILE_FILE = path.join(process.cwd(), 'data', 'user', 'profile.json');

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

async function ensureProfileFile() {
  try {
    // Ensure the user data directory exists
    const userDataDir = path.dirname(PROFILE_FILE);
    await fs.mkdir(userDataDir, { recursive: true });
    
    await fs.access(PROFILE_FILE);
  } catch {
    const defaultProfile: UserProfile = {
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
    };
    await fs.writeFile(PROFILE_FILE, JSON.stringify(defaultProfile, null, 2));
  }
}

export async function GET() {
  try {
    await ensureProfileFile();
    const data = await fs.readFile(PROFILE_FILE, 'utf8');
    const profile = JSON.parse(data);
    return NextResponse.json({ result: profile });
  } catch (error) {
    console.error('Error reading profile:', error);
    return NextResponse.json({ error: 'Failed to read profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();
    
    await ensureProfileFile();
    const currentData = await fs.readFile(PROFILE_FILE, 'utf8');
    const currentProfile = JSON.parse(currentData);
    
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...profileData,
      isOnboarded: true,
      createdAt: currentProfile.createdAt || new Date().toISOString()
    };
    
    await fs.writeFile(PROFILE_FILE, JSON.stringify(updatedProfile, null, 2));
    return NextResponse.json({ result: updatedProfile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
