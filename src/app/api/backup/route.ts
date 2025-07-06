import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const USER_DATA_DIR = path.join(process.cwd(), 'data', 'user');

// Export all user data as a ZIP file
export async function GET() {
  try {
    const zip = new JSZip();
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      appName: 'DSA Practice Tracker',
      description: 'User data backup containing progress, notes, profile, and revision data'
    };

    // Add metadata file
    zip.file('metadata.json', JSON.stringify(exportMetadata, null, 2));

    // Read all user data files
    const userDataFiles = ['profile.json', 'progress.json', 'notes.json', 'revision.json'];
    
    for (const file of userDataFiles) {
      const filePath = path.join(USER_DATA_DIR, file);
      try {
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf8');
          zip.file(file, data);
        } else {
          // Create default empty data if file doesn't exist
          const key = file.replace('.json', '');
          let defaultData = {};
          
          if (key === 'profile') {
            defaultData = {
              name: '',
              aim: '',
              targetDate: '',
              goals: { dailyProblems: 3, weeklyGoal: 20, focusAreas: [] },
              createdAt: new Date().toISOString(),
              isOnboarded: false
            };
          }
          
          zip.file(file, JSON.stringify(defaultData, null, 2));
        }
      } catch (error) {
        console.warn(`Failed to read ${file}:`, error);
        zip.file(file, JSON.stringify({}, null, 2));
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="dsa-tracker-backup-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Type': 'application/zip',
        'Content-Length': zipBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// Import user data from uploaded ZIP file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get('backup') as File;
    
    if (!zipFile) {
      return NextResponse.json(
        { error: 'No backup file provided. Please select a ZIP file to import.' },
        { status: 400 }
      );
    }

    if (!zipFile.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a ZIP file.' },
        { status: 400 }
      );
    }

    // Read the ZIP file
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipBuffer);

    // Check for metadata file to validate backup
    const metadataFile = loadedZip.file('metadata.json');
    if (!metadataFile) {
      return NextResponse.json(
        { error: 'Invalid backup file. Missing metadata. Please ensure you are uploading a valid DSA Tracker backup.' },
        { status: 400 }
      );
    }

    const metadataContent = await metadataFile.async('string');
    const metadata = JSON.parse(metadataContent);
    
    if (metadata.appName !== 'DSA Practice Tracker') {
      return NextResponse.json(
        { error: 'Invalid backup file. This backup was not created by DSA Practice Tracker.' },
        { status: 400 }
      );
    }

    // Ensure user data directory exists
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }

    const userDataFiles = ['profile.json', 'progress.json', 'notes.json', 'revision.json'];
    const results: Record<string, string> = {};

    // Import each data file
    for (const fileName of userDataFiles) {
      const zipEntry = loadedZip.file(fileName);
      if (zipEntry) {
        try {
          const fileContent = await zipEntry.async('string');
          const filePath = path.join(USER_DATA_DIR, fileName);
          
          // Validate JSON before writing
          JSON.parse(fileContent);
          fs.writeFileSync(filePath, fileContent);
          results[fileName] = 'imported';
        } catch (error) {
          console.error(`Failed to import ${fileName}:`, error);
          results[fileName] = 'failed - invalid JSON';
        }
      } else {
        results[fileName] = 'not_found_in_backup';
      }
    }

    return NextResponse.json({
      success: true,
      importDate: new Date().toISOString(),
      backupDate: metadata.exportDate,
      results,
      message: 'Data imported successfully! Your progress, notes, and settings have been restored.'
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data. Please check that your backup file is valid and not corrupted.' },
      { status: 500 }
    );
  }
}
