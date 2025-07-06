import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SHEET_CONFIGS } from '@/types/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('sheet');

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID is required' }, { status: 400 });
    }

    const config = SHEET_CONFIGS.find(c => c.id === sheetId);
    if (!config) {
      return NextResponse.json({ error: 'Invalid sheet ID' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'sheets', config.fileName);
    
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      
      return NextResponse.json({ 
        success: true, 
        data: data,
        sheetId: sheetId,
        sheetName: config.name
      });
    } catch (fileError) {
      console.error(`Error reading file ${config.fileName}:`, fileError);
      return NextResponse.json({ 
        error: `Failed to load sheet data: ${config.fileName}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sheet API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
