import { parseLog } from './logParser';
import { join } from 'path';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('Log Parser', () => {
    it('should parse valid log file', async () => {
        const mockLogContent = sampleLogContent();

        const parsedData = await parseLog(mockLogContent);

        expect(parsedData).toEqual({
            uniqueIPCount: 11,
            groupedUrls: [
                {
                    count: 2,
                    displayedItems: ['/docs/manage-websites/'],
                    othersCount: 0,
                },
                {
                    count: 1,
                    displayedItems: [
                        '/intranet-analytics/',
                        'http://example.net/faq/',
                        '/this/page/does/not/exist/',
                    ],
                    othersCount: 18,
                },
            ],
            groupedIPs: [
                { count: 4, displayedItems: ['168.41.191.40'], othersCount: 0 },
                {
                    count: 3,
                    displayedItems: [
                        '177.71.128.21',
                        '50.112.00.11',
                        '72.44.32.10',
                    ],
                    othersCount: 0,
                },
                {
                    count: 2,
                    displayedItems: [
                        '168.41.191.9',
                        '168.41.191.34',
                        '168.41.191.43',
                    ],
                    othersCount: 0,
                },
            ],
        });
    });
    // it('should flag invalid entries in log file but still parse the file if under error threshold', async () => {
    //     const mockLogContent = getMockLogContent();
    //     (fs.readFile as jest.Mock).mockResolvedValue(mockLogContent);

    //     const parsedData = await parseLog(mockLogContent);

    //     console.log(parsedData);

    // expect(parsedData).toEqual({
    //     uniqueIPCount: 11,
    //     groupedUrls: [
    //         {
    //             count: 2,
    //             displayedItems: ['/docs/manage-websites/'],
    //             othersCount: 0,
    //         },
    //         {
    //             count: 1,
    //             displayedItems: [
    //                 '/intranet-analytics/',
    //                 '/this/page/does/not/exist/',
    //                 'http://example.net/blog/category/meta/',
    //             ],
    //             othersCount: 16,
    //         },
    //     ],

    //     groupedIPs: [
    //         {
    //             count: 3,
    //             displayedItems: [
    //                 '177.71.128.21',
    //                 '168.41.191.40',
    //                 '50.112.00.11',
    //             ],
    //             othersCount: 0,
    //         },
    //         {
    //             count: 2,
    //             displayedItems: [
    //                 '168.41.191.9',
    //                 '168.41.191.34',
    //                 '168.41.191.43',
    //             ],
    //             othersCount: 1,
    //         },
    //         {
    //             count: 1,
    //             displayedItems: [
    //                 '168.41.191.41',
    //                 '50.112.00.28',
    //                 '72.44.32.11',
    //             ],
    //             othersCount: 1,
    //         },
    //     ],
    // });
    // });
});

function sampleLogContent(): string {
    const mockLogContent = `
    192.168.0.1 - - [10/Jul/2018:22:21:28 +0200] "GET /home HTTP/1.1" 200 3574 "-" "Mozilla/5.0"
    192.168.0.2 - - [10/Jul/2018:22:22:30 +0200] "POST /api/login HTTP/1.1" 200 450 "-" "Mozilla/5.0"
    192.168.0.3 - - [10/Jul/2018:22:23:15 +0200] "GET /home HTTP/1.1" 200 3574 "-" "Mozilla/5.0"
    192.168.0.1 - - [10/Jul/2018:22:24:50 +0200] "GET /about HTTP/1.1" 404 100 "-" "Mozilla/5.0"
    192.168.0.4 - - [10/Jul/2018:22:25:45 +0200] "PUT /api/user HTTP/1.1" 201 900 "-" "Mozilla/5.0"
    192.168.0.5 - - [10/Jul/2018:22:26:50 +0200] "DELETE /api/user/123 HTTP/1.1" 204 0 "-" "Mozilla/5.0"
    192.168.0.3 - - [10/Jul/2018:22:27:30 +0200] "GET /contact HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
    192.168.0.2 - - [10/Jul/2018:22:28:45 +0200] "POST /api/login HTTP/1.1" 200 450 "-" "Mozilla/5.0"
    192.168.0.1 - - [10/Jul/2018:22:29:50 +0200] "GET /about HTTP/1.1" 404 100 "-" "Mozilla/5.0"
    192.168.0.4 - - [10/Jul/2018:22:30:10 +0200] "PUT /api/user HTTP/1.1" 201 900 "-" "Mozilla/5.0"
    192.168.0.1 - - [10/Jul/2018:22:31:28 +0200] "GET /home HTTP/1.1" 200 3574 "-" "Mozilla/5.0"
    192.168.0.2 - - [10/Jul/2018:22:32:30 +0200] "POST /api/login HTTP/1.1" 200 450 "-" "Mozilla/5.0"
    192.168.0.5 - - [10/Jul/2018:22:33:50 +0200] "DELETE /api/user/123 HTTP/1.1" 204 0 "-" "Mozilla/5.0"
    192.168.0.3 - - [10/Jul/2018:22:34:45 +0200] "GET /contact HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
    192.168.0.4 - - [10/Jul/2018:22:35:50 +0200] "PUT /api/user HTTP/1.1" 201 900 "-" "Mozilla/5.0"
`;
    return mockLogContent;
}

// Test valid log parsing - DONE

// Test log file with invalid entries

// Test empty log file

// Test log file with one valid entry

// Test log file with multiple identical entries

// Test threshold edge case

// Test correct regex matching for IP addresses and HTTP requests

// Test log file with varying request methods

// Test log file with mixed valid and invalid log lines

// Test correct grouping of URLs and IPs

// Test correct handling of the “others” logic

// Test handling of special characters and edge cases in log lines
