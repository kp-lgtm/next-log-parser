import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
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
    });

    form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed' });
        }

        const logFile = files.logFile[0];
        if (!logFile) {
            return res.status(400).json({ message: 'No log file uploaded' });
        }

        const data = await fs.readFile(logFile.filepath);

        const storagePath = path.join(
            process.cwd(),
            'uploads',
            logFile.originalFilename,
        );

        // Move the file to the uploads folder (create folder if needed)
        await fs.mkdir(path.join(process.cwd(), 'uploads'), {
            recursive: true,
        });
        await fs.writeFile(storagePath, data);

        return res.status(200).json({
            message: 'File uploaded and stored successfully',
            logFile: logFile.originalFilename,
        });
    });
};

export default uploadHandler;
