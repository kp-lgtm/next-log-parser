import type { Metadata } from 'next';
import '@picocss/pico';

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
            <body>{children}</body>
        </html>
    );
}
