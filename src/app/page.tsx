'use client';

import React, { useState } from 'react';

export default function Home() {
    const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.log')) {
            setSelectedLogFile(file);
        } else {
            setUploadStatus('Please upload a valid log file.');
        }
    };

    const uploadFile = async () => {
        if (!selectedLogFile) {
            return;
        }

        const formData = new FormData();
        formData.append('logFile', selectedLogFile);

        console.log('FormData:', formData.get('logFile'));

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            setUploadStatus(data.message);
        } else {
            console.error('Failed to upload file');
        }
    };

    return (
        <div>
            <input type="file" accept=".log" onChange={handleFileChange} />
            {selectedLogFile && <p>Selected file: {selectedLogFile.name}</p>}
            <button onClick={uploadFile}>Submit</button>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
}
