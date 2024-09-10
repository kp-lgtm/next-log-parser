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
    const form = new formidable.IncomingForm();
    form.uploadDir = './logFileUploads'; // Temporary directory to store the uploaded file
    form.keepExtensions = true; // Keep the original file extension

    form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed' });
        }

        console.log('Parsed files:', files); // Add this log to inspect the files object

        // Access the first file in the logFile array
        const logFile = files.logFile[0];
        if (!logFile) {
            return res.status(400).json({ message: 'No log file uploaded' });
        }

        const data = await fs.readFile(logFile.filepath); // Read file content

        // Define the storage path for the final location of the file
        const storagePath = path.join(
            process.cwd(),
            'uploads',
            logFile.originalFilename,
        );

        // Move the file to the uploads folder (create folder if needed)
        await fs.mkdir(path.join(process.cwd(), 'uploads'), {
            recursive: true,
        });
        await fs.writeFile(storagePath, data); // Write the file to the target directory

        return res.status(200).json({
            message: 'File uploaded and stored successfully',
            logFile: logFile.originalFilename,
        });
    });
};

export default uploadHandler;
