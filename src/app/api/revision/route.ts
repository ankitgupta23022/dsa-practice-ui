import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RevisionData {
  result: { [key: string]: number };
}

const revisionFilePath = path.join(process.cwd(), 'data', 'user', 'revision.json');

export async function GET() {
  try {
    // Ensure directory exists
    const dir = path.dirname(revisionFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create default file if it doesn't exist
    if (!fs.existsSync(revisionFilePath)) {
      fs.writeFileSync(revisionFilePath, JSON.stringify({ result: {} }, null, 2));
    }
    
    const fileContent = fs.readFileSync(revisionFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading revision file:', error);
    return NextResponse.json({ result: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a bulk update (entire revision object) or single update
    if (body.problemId && typeof body.needsRevision === 'boolean') {
      // Single revision update
      const { problemId, needsRevision }: { problemId: string; needsRevision: boolean } = body;

      // Read current revision data
      let revisionData: RevisionData = { result: {} };
      try {
        const fileContent = fs.readFileSync(revisionFilePath, 'utf8');
        revisionData = JSON.parse(fileContent);
      } catch {
        // File doesn't exist or is invalid, start with empty data
        console.log('Creating new revision file');
      }

      // Update revision status
      if (needsRevision) {
        revisionData.result[problemId] = 1;
      } else {
        delete revisionData.result[problemId];
      }

      // Write back to file
      fs.writeFileSync(revisionFilePath, JSON.stringify(revisionData, null, 4));
    } else {
      // Bulk update - entire revision object
      const revisionData: RevisionData = { result: body };
      fs.writeFileSync(revisionFilePath, JSON.stringify(revisionData, null, 4));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating revision file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
