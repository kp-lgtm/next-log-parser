# Log Parser

## Overview

This project is a log parser that processes log files, extracting important metrics such as unique IP counts, top URLs, and IP activity. The application allows users to upload log files, parse them, and view the analysis of the data.

The application is built using **Next.js** (with the App Router) for the frontend and backend API routes, with file handling and log parsing logic implemented in TypeScript.

## Features

- **Upload Log Files**: Users can upload log files in `.log` format for analysis.
- **Parse and Analyze**: The app parses the log entries, counting unique IP addresses, most visited URLs, and active IPs.
- **Metrics**: Provides detailed metrics including:
  - Number of unique IPs
  - Top visited URLs grouped by visit count
  - Top active IPs grouped by request count
  - Detection of invalid log entries
- **Responsive Design**: The frontend is styled with responsive CSS to ensure usability across devices.

You can access the deployed app here: [Log Parser App](https://next-log-parser-643135354132.australia-southeast1.run.app)

## Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v14.x or higher)
- **npm** or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kenwoodp/next-log-parser.git
   ```

2. Navigate to the project directory:

   ```bash
   cd log-parser
   ```

3. Install the dependencies:

   ```bash
   npm install
    # or if using yarn
    yarn install
    ```

### Running the Project

To start the development server, run:

   ```bash
   npm run dev
    # or if using yarn
    yarn dev
   ```

Once the server is running, visit `http://localhost:3000` in your browser to access the log parser.

### Deployment

The project can be deployed to **Google Cloud Run** or any platform that supports **Docker**. Here's how to deploy with Docker:

1. Build the Docker image:

   ```bash
   docker build -t log-parser .
   ```

2. Run the Docker container:

    ```bash
    docker run -p 8080:8080 log-parser
    ```

Once running, you can access the app at `http://localhost:8080`.

## Usage

1. **Upload Log File**: On the main page, click the "Upload Log File" button and choose a log file in `.log` format.
2. **View Metrics**: After the file is uploaded and parsed, the metrics will be displayed, including:
   - Number of unique IP addresses
   - Top URLs by visit count
   - Top IPs by request count
3. **Invalid Logs**: Any invalid log entries will be detected and excluded from the analysis.

### Log File Format

The parser expects logs to follow the **Common Log Format**. Example:

    ```
    192.168.0.1 - - [10/Jul/2018:22:21:28 +0200] "GET /home HTTP/1.1" 200 3574 "-" "Mozilla/5.0"
    ```

Each log entry should include:
- **IP address**
- **Timestamp**
- **HTTP request** (method, URL, HTTP version)
- **Response status code**
- **Response size**

### API Routes

- **POST /api/upload**: Uploads and processes a log file.
  - Request body: FormData with a `.log` file
  - Response: JSON object containing the parsed metrics or an error message.

## Testing

The project uses **Jest** for unit testing. To run tests, use the following command:

    ```bash
    npm run test
    # or if using yarn
    yarn test
    ```

Test files are located in the `tests` directory. The log parsing logic is thoroughly tested with both valid and invalid log entries.

## Footnote

This project is intended to serve as a showcase of my learnings that I've been able to acquire during my time working at Mantel Group as an Associate Software Developer.

I decided to expand upon my knowledge of the Next.js as a React framework by teaching myself how to use the App router structure, up until undertaking this project, I had only had exposure to the "pages" router structure.

The decision was also made to containerise and deploy the project on Google Cloud Run to demonstrate the cloud computing skills that I'd developed through the completion of my GCP Associate Cloud Engineer cert, as well as through my experience working with cloud technologies and backend systems in TypeScript while on my engagement with Australian Energy Regulator (AER).
