import type { Metadata } from 'next';
import log from './public/log.png';
import './globals.css';

export const metadata: Metadata = {
    title: 'Log Parser',
    description: 'Upload, parse, and analyse log files.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <link rel="icon" href={log.src} type="image/png" />
            <body>{children}</body>
        </html>
    );
}
