import { parseLog } from '@/utils/logParser';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const logFile: File | null = data.get('logFile') as unknown as File;

    if (!logFile) {
        return NextResponse.json('No file uploaded', { status: 400 });
    }

    const bytes = await logFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(process.cwd(), 'uploads', logFile.name);

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create upload directory:', error);
        return NextResponse.json(
            { message: 'Failed to create upload directory' },
            { status: 500 },
        );
    }

    try {
        await writeFile(filePath, buffer);
        console.log('File saved to:', filePath);

        console.log('logFile;', logFile);

        const parsedData = await parseLog(filePath);
        await unlink(filePath);

        return NextResponse.json({
            message: 'File uploaded and parsed successfully',
            data: parsedData,
            status: 200,
        });
    } catch (error) {
        console.error('Failed to save file:', error);
        return NextResponse.json(
            { message: 'Failed to save file' },
            { status: 500 },
        );
    }
}
