require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedUsers = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        const Website = require('./models/Website');
        const WorkLog = require('./models/WorkLog');
        await Website.deleteMany();
        await WorkLog.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const dedupeSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        const clientPassword = await bcrypt.hash('12345678', dedupeSalt);

        // 1. Create Users
        const clientOnfees = await User.create({
            name: 'GenAI Solutions',
            email: 'info@genai.com',
            password: clientPassword,
            role: 'client'
        });

        const clientOnCampus = await User.create({
            name: 'OnCampus ERP',
            email: 'admin@oncampuserp.com',
            password: clientPassword,
            role: 'client'
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        const developer1 = await User.create({
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            password: hashedPassword,
            role: 'developer'
        });

        const developer2 = await User.create({
            name: 'Mike Chen',
            email: 'mike@example.com',
            password: hashedPassword,
            role: 'developer'
        });

        console.log('Users created');

        // 2. Create Websites
        const website1 = await Website.create({
            name: 'GenAI SaaS Platform',
            url: 'https://platform.genai.com',
            client: clientOnfees._id,
            developers: [developer1._id, developer2._id],
            seoHealthScore: 92,
            seoData: {
                title: 'GenAI - Enterprise AI Solutions',
                description: 'Leverage the power of generative AI for your enterprise.',
                h1: ['Transform Your Business with AI'],
                ogImage: 'https://via.placeholder.com/1200x630',
                loadTime: 450
            },
            lastSeoScan: new Date()
        });

        const websiteOnCampus = await Website.create({
            name: 'OnCampus ERP System',
            url: 'https://oncampuserp.com',
            client: clientOnCampus._id,
            developers: [developer1._id, developer2._id],
            seoHealthScore: 89,
            seoData: {
                title: 'OnCampus - Smart Education Management',
                description: 'Comprehensive ERP for educational institutions. Streamline admissions, fees, and academics.',
                h1: ['Streamline Your Campus Operations'],
                ogImage: 'https://via.placeholder.com/1200x630',
                loadTime: 580
            },
            lastSeoScan: new Date()
        });

        console.log('Websites created');

        // 3. Create High-Quality Work Logs
        const now = new Date();
        const workLogs = [];

        // --- CONVERSIONS (CRO) ---
        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Redesigned the "Request Demo" landing page with a sticky CTA and simplified form fields. \n\nResult: Demo request conversion rate increased by 18% in the first 48 hours.',
            durationMinutes: 180,
            tags: ['Conversions', 'CRO', 'UX'],
            createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
            isStarred: true
        });

        // NEW: Observation
        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'observation',
            description: 'Observed significant drop-off (65%) on the "Pricing" page from mobile devices. The comparison table is not responsive and requires horizontal scrolling, which frustrates users.',
            durationMinutes: 30,
            tags: ['Observation', 'Mobile', 'UX'],
            createdAt: new Date(now - 3 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'action',
            title: 'Authorize A/B Testing Tool',
            description: 'Requesting approval to integrate VWO for continuous A/B testing on the pricing page. Aiming to optimize the tier selection funnel.',
            status: 'approved',
            clientResponse: 'Approved. We need better data on tier preference.',
            tags: ['Conversions', 'Testing', 'Strategy'],
            createdAt: new Date(now - 5 * 60 * 60 * 1000)
        });

        // --- AEO (Answer Engine Optimization) & BLOGS ---

        // NEW: Report
        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'report',
            description: 'Weekly AEO Performance Report: \n- Voice Search Visibility: +25% \n- Featured Snippets: captured 3 new keywords ("best school erp", "student record system", "fee management") \n- Brand Authority in Chatbots: Rising.',
            durationMinutes: 60,
            tags: ['Report', 'AEO', 'Analytics'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000),
            isStarred: true
        });

        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Published a new detailed guide: "How to Digitalize Student Records". Structured specifically for voice search answers (AEO). \n\nResult: Already capturing the Featured Snippet for "digital student records school erp".',
            durationMinutes: 150,
            tags: ['AEO', 'Content', 'Voice Search'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Optimized existing FAQ section with conversational keywords ("What is the best ERP for...") to target AI chat responses. \n\nUpdate: Reduced "zero-click" searches by establishing brand authority in AI overviews.',
            durationMinutes: 90,
            tags: ['AEO', 'AI Optimization', 'Content'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000)
        });

        // --- SEO (Search Engine Optimization) ---
        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Implemented "SoftwareApplication" Schema.org markup across the platform product pages. \n\nResult: Rich snippets (star ratings & price range) are now appearing in SERPs, boosting CTR by ~12%.',
            durationMinutes: 135,
            tags: ['SEO', 'Schema', 'Traffic'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
            isStarred: true
        });

        // NEW: Observation
        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'observation',
            description: 'Competitor Alert: "EduSmart" has started ranking for "school ERP AI features". They published 5 new articles this week. We need to accelerate our AI-related content strategy.',
            durationMinutes: 45,
            tags: ['Observation', 'Competitor Analysis', 'Strategy'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Fixed critical specialized mobile usability issues on the "Parent Portal" login. \n\nResult: Mobile organic traffic bounce rate dropped from 45% to 28%.',
            durationMinutes: 110,
            tags: ['SEO', 'Mobile', 'Performance'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000)
        });

        // --- GEO (Generative Engine Optimization) ---
        workLogs.push({
            developer: developer1._id,
            website: websiteOnCampus._id,
            type: 'log',
            description: 'Enhanced the Knowledge Graph entry for "OnCampus ERP" by linking to verified Crunchbase and LinkedIn profiles. \n\nGoal: Ensure AI models (ChatGPT, Gemini) recognize OnCampus as a distinct, authoritative entity in the EdTech space.',
            durationMinutes: 160,
            tags: ['GEO', 'Entity', 'Brand Authority'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000),
            isStarred: true
        });

        // NEW: Report
        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'report',
            description: 'Monthly Technical Health Report: \n- Server Uptime: 99.99% \n- Average Page Load: 0.8s (Improved from 1.2s) \n- Broken Links: 0 \n- Mobile Usability Issues: 0',
            durationMinutes: 45,
            tags: ['Report', 'Technical', 'Health'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000)
        });

        // --- MORE CONTENT / BLOGS ---
        workLogs.push({
            developer: developer2._id,
            website: websiteOnCampus._id,
            type: 'action',
            title: 'Blog Post Draft: "AI in Schools"',
            description: 'Drafted blog post "The Role of AI in Modern School Administration". Focuses on long-tail keywords. Ready for review.',
            status: 'pending',
            tags: ['Content', 'Blog', 'Strategy'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000)
        });

        await WorkLog.create(workLogs);

        console.log(`Created ${workLogs.length} high-quality work logs and action items`);
        console.log('-----------------------------------');
        console.log('Client GenAI: info@genai.com / 12345678');
        console.log('Client OnCampus: admin@oncampuserp.com / 12345678');
        console.log('Admin: admin@example.com / 123456');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();
