import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ProgressData {
  result: { [key: string]: number };
}

const progressFilePath = path.join(process.cwd(), 'data', 'user', 'progress.json');

export async function GET() {
  try {
    // Ensure directory exists
    const dir = path.dirname(progressFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create default file if it doesn't exist
    if (!fs.existsSync(progressFilePath)) {
      fs.writeFileSync(progressFilePath, JSON.stringify({ result: {} }, null, 2));
    }
    
    const fileContent = fs.readFileSync(progressFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading progress file:', error);
    return NextResponse.json({ result: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a bulk update (entire progress object) or single update
    if (body.problemId && typeof body.completed === 'boolean') {
      // Single problem update
      const { problemId, completed }: { problemId: string; completed: boolean } = body;

      // Read current progress
      let progressData: ProgressData = { result: {} };
      try {
        const fileContent = fs.readFileSync(progressFilePath, 'utf8');
        progressData = JSON.parse(fileContent);
      } catch {
        // File doesn't exist or is invalid, start with empty data
        console.log('Creating new progress file');
      }

      // Update progress
      if (completed) {
        progressData.result[problemId] = 1;
      } else {
        delete progressData.result[problemId];
      }

      // Write back to file
      fs.writeFileSync(progressFilePath, JSON.stringify(progressData, null, 4));
    } else {
      // Bulk update - entire progress object
      const progressData: ProgressData = { result: body };
      fs.writeFileSync(progressFilePath, JSON.stringify(progressData, null, 4));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
