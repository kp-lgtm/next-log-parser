import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import { parseLog } from '@/utils/logParser';
import path from 'path';

// Disable built-in Next.js body parser
export const config = { api: { bodyParser: false } };

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }

    const formidable = require('formidable');
    const form = new formidable.IncomingForm({
        uploadDir: path.join(process.cwd(), '/uploads'),
        keepExtensions: true,
        maxFileSize: 250 * 1024 * 1024, // 250MB - *208MB is about 1 million lines*
    });

    form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
            res.status(500).json({ message: 'File upload failed' });
            return;
        }

        const logFile = files.logFile[0];

        try {
            const parsedData = await parseLog(logFile.filepath);

            res.status(200).json({
                message: 'File uploaded and parsed successfully',
                data: parsedData,
            });

            fs.unlink(logFile.filepath);
        } catch (error) {
            console.error('Log parsing failed:', error);
            res.status(500).json({
                message: 'Log parsing failed',
                error: (error as Error).message,
            });
        }
    });
};

export default uploadHandler;
