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
        <div className={styles.container}>
            <header>
                <h1 className={styles.header}>Upload Log File</h1>
            </header>

            <main>
                <article>
                    <form className={styles.form}>
                        <input
                            type="file"
                            accept=".log"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                        <button
                            onClick={uploadFile}
                            disabled={isUploading || !selectedLogFile}
                            className={styles.submitButton}
                        >
                            {isUploading ? 'Uploading...' : 'Upload and Parse'}
                        </button>

                        {error && (
                            <p className={styles.errorMessage}>
                                Error: {error}
                            </p>
                        )}
                    </form>
                </article>

                {parsedData && (
                    <article className={styles.article}>
                        <h2 className={styles.parsedDataTitle}>
                            Parsed Log Data
                        </h2>
                        <h3 className={styles.parsedDataSubtitle}>
                            Unique IP Addresses
                        </h3>
                        <p className={styles.listItem}>
                            Number of unique IP addresses:{' '}
                            <strong>{parsedData.uniqueIPCount}</strong>
                        </p>

                        <h3 className={styles.parsedDataSubtitle}>
                            Top 3 URL Groups
                        </h3>
                        <ol className={styles.list}>
                            {parsedData.groupedUrls.map(
                                (
                                    { count, displayedItems, othersCount }: any,
                                    index: number,
                                ) => (
                                    <li key={index} className={styles.listItem}>
                                        {displayedItems.join(', ')}
                                        {othersCount > 0 &&
                                            ` and ${othersCount} others`}{' '}
                                        -{' '}
                                        <strong>
                                            {count} visit{count > 1 && 's'}
                                        </strong>
                                    </li>
                                ),
                            )}
                        </ol>

                        <h3 className={styles.parsedDataSubtitle}>
                            Top 3 IP Groups
                        </h3>
                        <ol className={styles.list}>
                            {parsedData.groupedIPs.map(
                                (
                                    { count, displayedItems, othersCount }: any,
                                    index: number,
                                ) => (
                                    <li key={index} className={styles.listItem}>
                                        {displayedItems.join(', ')}
                                        {othersCount > 0 &&
                                            ` and ${othersCount} others`}{' '}
                                        -{' '}
                                        <strong>
                                            {count} request{count > 1 && 's'}
                                        </strong>
                                    </li>
                                ),
                            )}
                        </ol>
                    </article>
                )}
            </main>
        </div>
    );
}
