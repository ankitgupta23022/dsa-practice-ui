import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface NotesData {
  result: { [key: string]: string };
}

const notesFilePath = path.join(process.cwd(), 'data', 'user', 'notes.json');

export async function GET() {
  try {
    // Ensure directory exists
    const dir = path.dirname(notesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create default file if it doesn't exist
    if (!fs.existsSync(notesFilePath)) {
      fs.writeFileSync(notesFilePath, JSON.stringify({ result: {} }, null, 2));
    }
    
    const fileContent = fs.readFileSync(notesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading notes file:', error);
    return NextResponse.json({ result: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a bulk update (entire notes object) or single update
    if (body.problemId && typeof body.note === 'string') {
      // Single note update
      const { problemId, note }: { problemId: string; note: string } = body;

      // Read current notes
      let notesData: NotesData = { result: {} };
      try {
        const fileContent = fs.readFileSync(notesFilePath, 'utf8');
        notesData = JSON.parse(fileContent);
      } catch {
        // File doesn't exist or is invalid, start with empty data
        console.log('Creating new notes file');
      }

      // Update notes
      if (note && note.trim()) {
        notesData.result[problemId] = note.trim();
      } else {
        delete notesData.result[problemId];
      }

      // Write back to file
      fs.writeFileSync(notesFilePath, JSON.stringify(notesData, null, 4));
    } else {
      // Bulk update - entire notes object
      const notesData: NotesData = { result: body };
      fs.writeFileSync(notesFilePath, JSON.stringify(notesData, null, 4));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notes file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
