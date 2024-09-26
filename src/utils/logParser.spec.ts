import {
    parseLog,
    isValidIPv4,
    isValidHTTPRequest,
    groupByVisitCount,
    limitGroupEntries,
} from './logParser';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('Log Parser', () => {
    it('should parse valid log file', async () => {
        const mockLogContent = sampleLogContent();
        jest.spyOn(fs, 'readFile').mockResolvedValue(mockLogContent);

        const parsedData = await parseLog(mockLogContent);

        expect(parsedData).toEqual({
            uniqueIPCount: 5,
            groupedUrls: [
                {
                    count: 3,
                    displayedItems: ['/home', '/api/login', '/api/user'],
                    othersCount: 0,
                },
                {
                    count: 2,
                    displayedItems: ['/about', '/api/user/123', '/contact'],
                    othersCount: 0,
                },
            ],
            groupedIPs: [
                {
                    count: 4,
                    displayedItems: ['192.168.0.1'],
                    othersCount: 0,
                },
                {
                    count: 3,
                    displayedItems: [
                        '192.168.0.2',
                        '192.168.0.3',
                        '192.168.0.4',
                    ],
                    othersCount: 0,
                },
                {
                    count: 2,
                    displayedItems: ['192.168.0.5'],
                    othersCount: 0,
                },
            ],
            invalidLogCount: 0,
        });
    });
    it('should flag invalid entries in log file but still parse the file if under error threshold', async () => {
        let mockLogContent = sampleLogContent();
        mockLogContent += '\ninvalid entry';

        jest.spyOn(fs, 'readFile').mockResolvedValue(mockLogContent);

        const parsedData = await parseLog(mockLogContent);

        expect(parsedData).toEqual({
            uniqueIPCount: 5,
            groupedUrls: [
                {
                    count: 3,
                    displayedItems: ['/home', '/api/login', '/api/user'],
                    othersCount: 0,
                },
                {
                    count: 2,
                    displayedItems: ['/about', '/api/user/123', '/contact'],
                    othersCount: 0,
                },
            ],
            groupedIPs: [
                {
                    count: 4,
                    displayedItems: ['192.168.0.1'],
                    othersCount: 0,
                },
                {
                    count: 3,
                    displayedItems: [
                        '192.168.0.2',
                        '192.168.0.3',
                        '192.168.0.4',
                    ],
                    othersCount: 0,
                },
                {
                    count: 2,
                    displayedItems: ['192.168.0.5'],
                    othersCount: 0,
                },
            ],
            invalidLogCount: 1,
        });
    });
    it('should throw an error if the log file contains too many invalid entries', async () => {
        let mockLogContent = sampleLogContent();
        mockLogContent += '\ninvalid entry\ninvalid entry\ninvalid entry';

        jest.spyOn(fs, 'readFile').mockResolvedValue(mockLogContent);

        await expect(parseLog(mockLogContent)).rejects.toThrow(
            'Log file contains too many invalid entries',
        );
    });
    it('should handle empty log file', async () => {
        jest.spyOn(fs, 'readFile').mockResolvedValue('');

        const parsedData = await parseLog('');

        expect(parsedData).toEqual({
            uniqueIPCount: 0,
            groupedUrls: [],
            groupedIPs: [],
            invalidLogCount: 0,
        });
    });
    it('should handle log file with one valid entry', async () => {
        const mockLogContent = `192.168.0.1 - - [10/Jul/2018:22:21:28 +0200] "GET /home HTTP/1.1" 200 3574 "-" "Mozilla/5.0"`;
        jest.spyOn(fs, 'readFile').mockResolvedValue(mockLogContent);

        const parsedData = await parseLog(mockLogContent);

        expect(parsedData).toEqual({
            uniqueIPCount: 1,
            groupedUrls: [
                {
                    count: 1,
                    displayedItems: ['/home'],
                    othersCount: 0,
                },
            ],
            groupedIPs: [
                {
                    count: 1,
                    displayedItems: ['192.168.0.1'],
                    othersCount: 0,
                },
            ],
            invalidLogCount: 0,
        });
    });
});

describe('isValidIPv4', () => {
    it('should return true for valid IPv4 addresses', () => {
        const validIPs = [
            '50.112.00.11',
            '50.112.00.28',
            '192.168.0.2',
            '255.255.255.255',
            '001.02.111.205',
        ];

        validIPs.forEach(ip => {
            expect(isValidIPv4(ip)).toBe(true);
        });
    });
    it('should return false for invalid IPv4 addresses', () => {
        const invalidIPs = [
            '256.100.50.25',
            '192.168.500.1',
            '192.168.0.300',
            '192.168.0.1.1',
            '192.168.0',
            '192.168..1',
            '192.168.0.-1',
            '192.168.0.',
            '192.168.0.abc',
        ];

        invalidIPs.forEach(ip => {
            expect(isValidIPv4(ip)).toBe(false);
        });
    });
});

describe('isValidHTTPRequest', () => {
    it('should return true for valid HTTP requests', () => {
        const validRequests = [
            'GET /home HTTP/1.1',
            'POST /api/login HTTP/1.1',
            'PUT /api/user HTTP/1.1',
            'DELETE /api/user/123 HTTP/1.1',
            'GET /contact HTTP/1.1',
            'POST /api/login HTTP/1.1',
        ];

        validRequests.forEach(request => {
            expect(isValidHTTPRequest(request)).toBeTruthy();
        });
    });
    it('should return false for invalid HTTP requests', () => {
        const invalidRequests = [
            'INVALID /home HTTP/1.1',
            'GET home HTTP/1.1',
            'GET /home HTT/1.1',
            'POST http://example.com HTTP/',
            'PATCH /api/data HTTP/1.1 extra',
            'GET /home',
            'POST /api/login HTTP1.1',
        ];

        invalidRequests.forEach(request => {
            expect(isValidHTTPRequest(request)).toBeFalsy();
        });
    });
});

describe('groupByVisitCount', () => {
    it('should group URLs by visit count', () => {
        const visits = new Map<string, number>([
            ['/home', 3],
            ['/about', 1],
            ['/contact', 2],
            ['/search', 1],
            ['/faq', 2],
        ]);

        const groupedVisits = groupByVisitCount(visits);

        expect(groupedVisits).toEqual([
            [3, ['/home']],
            [2, ['/contact', '/faq']],
            [1, ['/about', '/search']],
        ]);
    });
    it('should group IPs by visit count', () => {
        const visits = new Map<string, number>([
            ['192.168.0.1', 3],
            ['192.168.0.2', 3],
            ['192.168.0.3', 2],
            ['192.168.0.4', 2],
            ['192.168.0.5', 4],
            ['192.168.0.6', 4],
        ]);

        expect(groupByVisitCount(visits)).toEqual([
            [4, ['192.168.0.5', '192.168.0.6']],
            [3, ['192.168.0.1', '192.168.0.2']],
            [2, ['192.168.0.3', '192.168.0.4']],
        ]);
    });
});

describe('limitGroupEntries', () => {
    it('should limit the number of entries to three in each group', () => {
        const groups: [number, string[]][] = [
            [3, ['/home', '/about', '/contact', '/faq']],
            [
                2,
                [
                    '/search',
                    '/login',
                    '/register',
                    '/profile',
                    '/hot-topics',
                    '/support',
                ],
            ],
            [1, ['/terms', '/privacy', '/contact-us']],
        ];

        expect(limitGroupEntries(groups)).toEqual([
            {
                count: 3,
                displayedItems: ['/home', '/about', '/contact'],
                othersCount: 1,
            },
            {
                count: 2,
                displayedItems: ['/search', '/login', '/register'],
                othersCount: 3,
            },
            {
                count: 1,
                displayedItems: ['/terms', '/privacy', '/contact-us'],
                othersCount: 0,
            },
        ]);
    });
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
