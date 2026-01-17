export interface ProjectInterface {
    id: string;
    title: string;
    description: string;
    shortOverview: string;
    fullDescription: string;
    subtitle?: string;
    image: string;
    gallery?: string[];
    tech: string[];
    features: string[];
    responsibilities: string[];
    github?: string;
    live?: string;
    isPersonal?: boolean;
}

export const ACTIFY_PROJECT: ProjectInterface = {
    id: 'actify',
    title: 'Actify',
    subtitle: 'Daily Action Tracker',
    description: 'A habit tracking PWA that helps users build streaks and stay motivated with AI-powered encouragement.',
    shortOverview: 'Actify is a mobile-first Progressive Web App designed to help users track daily small actions. It features a clean, distraction-free UI, intelligent task sorting, and AI-generated motivation to keep users engaged.',
    fullDescription: `Actify is a personal productivity tool built to solve the problem of overwhelming to-do lists. Unlike complex project management tools, Actify focuses on small, daily actions that compound over time. The application distinguishes between "Today's" tasks and "Pending" items, using color-coded urgency to help users prioritize effectively.

Built with Angular and Firebase, the app offers a seamless offline-first experience as a PWA. It leverages Google's Gemini AI to provide personalized motivational messages, adding a human touch to the tracking experience. The "History" feature allows users to visualize their progress and maintain streaks, reinforcing positive habits.`,
    image: 'assets/projects/actify.webp',
    gallery: [
        'assets/projects/actify/dashboard.webp',
        'assets/projects/actify/history.webp',
        'assets/projects/actify/mobile.webp'
    ],
    tech: [
        'Angular',
        'TypeScript',
        'TailwindCSS',
        'Firebase',
        'Google Gemini AI',
        'PWA',
        'RxJS'
    ],
    features: [
        'Smart Task Sorting: Automatically separates daily tasks from pending ones.',
        'Visual Urgency: Color-coded indicators for pending tasks.',
        'AI Motivation: Personalized encouragement using Google Gemini.',
        'Progressive Web App: Installable on mobile devices with offline support.',
        'Streak Tracking: Visual history of completed actions.',
        'Dark Mode Support: Optimized for all lighting conditions.',
        'Clean UX: Minimalist design focused on quick interactions.'
    ],
    responsibilities: [
        'Architected and built the entire frontend using Angular and standalone components.',
        'Designed a mobile-first UI/UX with TailwindCSS for a native-app feel.',
        'Integrated Google Gemini AI to generate dynamic motivational content.',
        'Implemented Firebase for real-time data syncing and authentication.',
        'Optimized performance and accessibility, achieving 100% Lighthouse scores.'
    ],
    github: 'https://github.com/yourusername/actify',
    live: 'https://actify-app.netlify.app',
    isPersonal: true
};
