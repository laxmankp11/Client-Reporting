# Client Reporting System Documentation

## Overview
The Client Reporting System is a comprehensive platform designed to bridge the gap between digital agencies (Admins), their developers, and their clients. It provides a centralized hub for tracking website performance, SEO health, and developer work logs, ensuring transparency and ease of reporting.

## Core Workflows & Roles

### 1. The Admin (Agency Owner)
**Role:** Manages the entire ecosystem.
-   **Responsibilities:**
    -   Create and manage User accounts (Clients and Developers).
    -   Onboard new **Websites** and assign them to specific Clients.
    -   Assign **Developers** to specific Websites.
    -   View high-level stats (Total Clients, Active Websites, Work Logs).

### 2. The Developer
**Role:** The executor of work.
-   **Responsibilities:**
    -   View assigned Websites.
    -   **Log Work**: Record detailed work logs (Description, Duration, Tags) for specific websites.
    -   These logs automatically feed into the Client's dashboard for reporting.

### 3. The Client
**Role:** The consumer of reports.
-   **Responsibilities:**
    -   Log in to a personalized **Dashboard**.
    -   View all owned **Websites** in a card view.
    -   **SEO Health**: View real-time SEO Health Scores and performance metrics (Load Time, H1 Structure).
    -   **Traffic Analytics**: View 30-day click trends from Google Search Console (GSC).
    -   **Work Reports**: View a timeline of "Recent Activity" showing exactly what developers have been working on (Task, Date, Time Spent).

## Key Features & Coverage

### 1. Website Performance Monitoring
The system tracks key metrics for every onboarded website:
-   **SEO Health Score**: A calculated percentage (0-100%) indicating the site's optimization level.
-   **Performance Metrics**: Tracks page load speed (e.g., <2000ms goals) and structural integrity (H1 tags).
-   **GSC Integration**: Visualizes Google Search Console data (Clicks/Impressions) directly in the dashboard.

### 2. Transparent Work Reporting
Replaces manual status updates with a live feed:
-   Developers log work via the API/Interface.
-   Clients see these logs immediately in their "Recent Activity" table.
-   Includes granular details: Date, Project Name, Task Description, Tags (e.g., "Bugfix", "Feature"), and Duration.

## Credentials

### Default Admin (Seed)
*Used for system setup and management.*
-   **Email:** `admin@example.com`
-   **Password:** `123456`

### Demo Client User
*Existing user for testing the Client Dashboard flow.*
-   **Email:** `sanjiv@gmail.com`
-   **Password:** `12345678`

## Technical Flow
1.  **Authentication**: JWT-based login (`/api/auth/login`).
2.  **Data Fetching**: The dashboard aggregates data from multiple sources:
    -   `/api/websites`: Fetches assigned/owned websites.
    -   `/api/worklogs`: Fetches work history.
    -   `/api/websites/:id/gsc`: Proxies real-time analytics data.
