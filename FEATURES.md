# Application Features and Details

This document outlines the main features of the application, their corresponding URL paths, and a description of what each feature provides. This information can be used as a basis for creating an FAQ.

## Core Features

### 1. Login
*   **Path**: `/`
*   **Provides**:
    *   Allows users to authenticate and access the application.
    *   If a user is already authenticated, they are typically redirected to their default dashboard.

### 2. Dashboard
*   **Path**: `/:keyword/dashboard` (where `:keyword` is the active project name)
*   **Provides**:
    *   An overview of key metrics and trends related to the active keyword/project.
    *   **Topics to watch**: Displays trending topics, highlighting issues and most viral content. Users can switch between "Issues" and "Most Viral" views.
    *   **KOL to Watch**: Identifies and tracks Key Opinion Leaders (influencers), showing who is most negative or most viral. Users can switch between these views.
    *   **Keywords Trends**: Visualizes trends for keywords over time, including mentions, reach, and sentiment. Users can switch between "Mentions & Reach" and "Sentiment" views.
    *   **Context of discussion**: Presents a word cloud showing the most frequently mentioned keywords and their associated sentiment (All, Positive, Negative).
    *   **Mentions**: Lists individual mentions from various platforms. Users can sort these by "Popular first" or "Recent". Includes pagination for browsing through mentions.
    *   **Search Functionality**: Allows users to search for specific keywords within the dashboard data, with an option for "Search exact phrase".
    *   **Filtering**:
        *   **Date Filter**: Users can filter data by specific date ranges.
        *   **Advance Filter**: Provides options to filter by channels (platforms), sentiment, importance of mentions, influence score of users, region, language, and domain.
        *   **Platform Tabs**: Allows quick filtering of data by specific platforms: All Platform, Tiktok, X/Twitter, Instagram, Media.
    *   **Navigation**: Provides "See all" links to navigate to more detailed pages for Topics and KOLs.

### 3. Topic Analysis
*   **Path**: `/:keyword/topics`
*   **Provides**:
    *   A dedicated page for a more detailed analysis of various topics related to the active keyword/project.
    *   **Topics Table**: Displays a comprehensive list of topics in a table format.
    *   **Filtering**:
        *   **Date Filter**: Allows users to filter the topics based on specific date ranges.
        *   **Advance Filter**: Offers advanced filtering capabilities, likely including options for channels (platforms), sentiment, importance, influence scores, region, language, and domain.
    *   **Pagination**: Implements pagination to allow users to navigate through potentially long lists of topics.
    *   **Navigation to Topic Detail**: When a user clicks on a specific topic in the table, they are navigated to a more detailed view for that topic at the `/:keyword/topics-detail` path.

### 4. Topic Detail View
*   **Path**: `/:keyword/topics-detail`
*   **Provides**:
    *   An in-depth analysis page for a single, specific topic selected from the main "Topic Analysis" page.
    *   **Topic Header**: Displays the selected topic's name (`unified_issue`), total number of mentions, a percentage breakdown of positive, negative, and neutral sentiment for that topic, and a description of the topic.
    *   **Data Visualizations & Components**:
        *   **Top Mentions**: Lists the most significant mentions specifically related to this topic.
        *   **Context of Discussion**: A word cloud generated from the content of mentions for this topic.
        *   **KOL to Watch**: Identifies Key Opinion Leaders who are influential or active in discussions about this particular topic.
        *   **Occurrences**: A chart illustrating the volume of mentions for this topic over time, showing trends and spikes.
        *   **Channel Share**: Shows the distribution of mentions for this topic across different platforms (e.g., Twitter, Instagram, News).
        *   **Intent Share**: Analyzes and displays the perceived intent behind the mentions related to this topic (e.g., to inform, to advocate, to ask).
        *   **Emotions Share**: Visualizes the range and proportion of different emotions expressed in the mentions concerning this topic.
        *   **Overall Sentiments**: Provides a comprehensive sentiment analysis for the topic, potentially including drivers of sentiment and regional sentiment variations.
        *   **Topics Share**: Illustrates the prominence of this specific topic in relation to other ongoing discussions or topics.
    *   **Filtering**: Date Filter and Advance Filter to refine data for the specific topic.
    *   **Navigation**: "Back to Overview" link to `/:keyword/topics`, and "See all mentions/KOL" links to respective main pages, possibly pre-filtered.

### 5. Summary
*   **Path**: `/:keyword/summary`
*   **Provides**:
    *   A high-level overview and snapshot of the performance related to the active keyword/project.
    *   **Presence Score**: Prominently displays a "Presence Score" reflecting overall visibility.
    *   **Project/Keyword Name**: Indicates the active project.
    *   **Date Filtering**: Allows filtering summary data by date.
    *   **Key Data Sections**: Top Mentions (Popular/Recent), Summary Statistics (mentions, reach, interactions, sentiment), Keyword Trends, Influencers (KOLs & Sites), Engagement Stats.
    *   **Navigation**: "See All" links to detailed Mentions, KOLs, and Analysis pages.

### 6. Analysis
*   **Path**: `/:keyword/analysis`
*   **Provides**:
    *   A comprehensive analytical view of the active keyword or project.
    *   **Search and Filtering**: Keyword search (with exact phrase), Date Filter, Advanced Filter.
    *   **Key Analytical Components**: Overview, Mentions (Most Popular/From top public profiles, paginated), Keyword Trends, Mentions by Categories, Sentiment (Keyword-based), Sentiment by Categories, Most Share of Voice (paginated), Most Followers (paginated), Presence Score, Sentiment Breakdown, Trending Hashtags (paginated), Trending Links (paginated), Context of Discussion (word cloud), Most Popular Emojis.
    *   **Navigation**: "See detail comparison" to `/:keyword/comparison`, "See all mentions" to `/:keyword/mentions`.

### 7. Comparison
*   **Path**: `/:keyword/comparison`
*   **Provides**:
    *   An interface for side-by-side comparisons.
    *   **Tab-based Navigation**:
        *   **Compare Projects**: Compare metrics of multiple selected projects.
        *   **Compare Periods**: Compare data for the current project across different time periods.
        *   **Compare Topics**: Compare different topics, possibly within the same or across projects.
    *   Dynamic content display based on the selected comparison type.

### 8. Key Opinion Leader (KOL) Analysis
*   **Path**: `/:keyword/kol`
*   **Provides**:
    *   A page for identifying and analyzing Key Opinion Leaders (influencers, brands, media).
    *   **Tab-based Filtering**: All, Individual, Brand/Media.
    *   **Date and Advanced Filtering**.
    *   **KOL Table**: Displays Profile Name (with image, username, channel link, category), Mentions (clickable), Reach, Followers, Share of Voice, Actively Discussing (topics), Sentiments (positive/negative/neutral breakdown), Influence Score.
    *   **Pagination**.
    *   **Navigation to Mentions**: Clicking a KOL's mention count leads to the Mentions page, filtered for that KOL.

### 9. MoskalAI (AI Chat Assistant)
*   **Path**: `/:keyword/moskal-ai`
*   **Provides**:
    *   An interactive chat interface for AI-generated responses and analyses related to the current project.
    *   **Contextual Understanding**: Aware of the active project and its keywords.
    *   **Rich Responses**: Can include formatted text, charts, tables, insights, and footnotes.
    *   **Streaming Responses**: AI answers appear incrementally.
    *   **User Input**: Textarea for queries.
    *   **Feedback System**: Users can rate AI responses (Helpful, Not Helpful, Inaccurate).
    *   **Personalized Greeting** and **Disclaimer**.

### 10. Mentions
*   **Path**: `/:keyword/mentions`
*   **Provides**:
    *   A page for viewing, searching, and filtering individual mentions.
    *   **Mention Display**: Lists mentions with content, author, platform, engagement, sentiment, and a "View Post" link.
    *   **Search Functionality**: Search within mentions, with an exact phrase option.
    *   **Comprehensive Filtering**: Date Filter, Advanced Filter (channel, sentiment, importance, influence, region, language, domain).
    *   **Sorting Options**: Recent First, Popular First.
    *   **Pagination**.
    *   **Contextual Navigation**: Can be pre-filtered when navigated from other pages (e.g., Topic Detail, Summary, Analysis, KOL).

### 11. Generate Report
*   **Path**: `/:keyword/generate-report`
*   **Provides**:
    *   A form to configure and generate a sentiment analysis report for a specific project.
    *   **Date Range Selection**.
    *   **Keyword Configuration**: Displays project keywords and allows adding additional custom keywords for the report.
    *   **Email Recipient**: User specifies an email for report delivery.
    *   **Report Generation Trigger**: "Generate & Send Report" button.
    *   **Notifications**: Toast notifications for report generation status.
    *   **Navigation**: Link to the "Report List" page.

### 12. Report List
*   **Path**: `/report-list`
*   **Provides**:
    *   A page to view and manage generated reports.
    *   **Report Table**: Lists reports with User/Topic, Status (Processing, Completed, Failed), Date Range, Created date, Keywords, and Actions.
    *   **Status Updates**: Periodically refreshes report statuses.
    *   **Search Functionality** for reports.
    *   **Client-side Pagination**.
    *   **Actions**: Download Report (for completed), View Summary (modal), Regenerate Report (for failed/others, with option to edit params), View Error (for failed).
    *   **Navigation**: Link back to "Generate Report" page.

### 13. Account Settings
*   **Path**: `/account-settings`
*   **Provides**:
    *   A central hub for managing user-specific account details.
    *   **Main Settings Page**: Displays user email, Logout button.
    *   **Navigation to Sub-sections**:
        *   **Integrations** (Facebook, Instagram, LinkedIn - planned/partially implemented).
        *   **User Access Management**: Manage global and project-specific user permissions and roles. Add new users, remove access.
        *   **Change Email Address**: Update registered email.
        *   **Change Password**: Change account password.

### 14. Project Settings
*   **Path**: `/:keyword/settings` (where `:keyword` is the project name)
*   **Provides**:
    *   Page for managing settings of a specific project.
    *   **Project Information**: Displays project ID, Name, Status (Owned/Accessible), Role, Created/Updated dates.
    *   **Manage Keywords**: (For project owner/full_access users) View, add, remove, and save keywords for the project.
    *   **Danger Zone**: (For project owner only) Option to delete the project with a confirmation dialog.

### 15. Onboarding (New Project Creation)
*   **Path**: `/onboard`
*   **Provides**:
    *   A form for new users or users creating a new project.
    *   **Project Creation**:
        *   Input keywords (first keyword becomes project name).
        *   Keyword suggestions are provided based on the first keyword.
        *   Select language to track (All, English, Indonesia).
    *   **Redirection**: Existing users with projects are usually redirected to their dashboard, bypassing this page unless explicitly navigated to.
    *   **Submission**: Creates the project and navigates to its dashboard.

---

This list should cover the primary functionalities of the application based on the analyzed router and page components.
