'use client';

import React, { useState } from 'react';

export default function Home() {
    const [selectedLogFile, setSelectedLogFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedLogFile(file || null);
    };

    const uploadFile = async () => {
        if (!selectedLogFile) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('logFile', selectedLogFile);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setParsedData(data.data); // Set the parsed data in state
            } else {
                const errorData = await res.json();
                setError(
                    errorData.message || 'Failed to upload and parse file.',
                );
            }
        } catch (error) {
            setError('Error uploading file.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <header>
                <h1 className="text-5xl font-bold underline">
                    Upload Log File
                </h1>
            </header>

            <main>
                <article>
                    <form method="POST" encType="multipart/form-data">
                        <input
                            type="file"
                            accept=".log"
                            onChange={handleFileChange}
                            style={{ width: 'auto' }}
                        />
                        <button
                            onClick={uploadFile}
                            disabled={isUploading || !selectedLogFile}
                        >
                            {isUploading ? 'Uploading...' : 'Upload and Parse'}
                        </button>

                        {error && <p>Error: {error}</p>}
                    </form>
                </article>

                {parsedData && (
                    <article>
                        <h2>Parsed Log Data</h2>
                        <p>
                            Number of unique IP addresses:{' '}
                            {parsedData.uniqueIPCount}
                        </p>

                        <h3>Top 3 Most Visited URLs</h3>
                        <ul>
                            {parsedData.top3Urls.map(
                                (url: [string, number], index: number) => (
                                    <li key={index}>
                                        {url[0]} - {url[1]} visits
                                    </li>
                                ),
                            )}
                        </ul>

                        <h3>Top 3 Most Active IP Addresses</h3>
                        <ul>
                            {parsedData.top3IPs.map(
                                (ip: [string, number], index: number) => (
                                    <li key={index}>
                                        {ip[0]} - {ip[1]} requests
                                    </li>
                                ),
                            )}
                        </ul>
                    </article>
                )}
            </main>
        </div>
    );
}
