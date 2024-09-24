'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

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
                setParsedData(data.data);
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
                <h1>Upload Log File</h1>
            </header>

            <main>
                <article>
                    <form>
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

                        <h3>Top 3 URL Groups</h3>
                        <ul>
                            {parsedData.groupedUrls.map(
                                (
                                    { count, displayedItems, othersCount }: any,
                                    index: number,
                                ) => (
                                    <li key={index}>
                                        {displayedItems.join(', ')}
                                        {othersCount > 0 &&
                                            ` and ${othersCount} others`}{' '}
                                        - {count} visits
                                    </li>
                                ),
                            )}
                        </ul>

                        <h3>Top 3 IP Groups</h3>
                        <ul>
                            {parsedData.groupedIPs.map(
                                (
                                    { count, displayedItems, othersCount }: any,
                                    index: number,
                                ) => (
                                    <li key={index}>
                                        {displayedItems.join(', ')}
                                        {othersCount > 0 &&
                                            ` and ${othersCount} others`}{' '}
                                        - {count} requests
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
