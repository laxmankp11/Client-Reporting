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
        const hashedPassword = await bcrypt.hash('123456', salt);
        const clientPassword = await bcrypt.hash('12345678', salt);

        // 1. Create Users
        const clientOnfees = await User.create({
            name: 'OnFees Client',
            email: 'info@onfees.com',
            password: clientPassword,
            role: 'client'
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        const client1 = await User.create({
            name: 'Acme Corp',
            email: 'client@example.com',
            password: clientPassword,
            role: 'client'
        });

        const client2 = await User.create({
            name: 'TechStart Inc',
            email: 'techstart@example.com',
            password: clientPassword,
            role: 'client'
        });

        const developer1 = await User.create({
            name: 'John Dev',
            email: 'dev@example.com',
            password: hashedPassword,
            role: 'developer'
        });

        const developer2 = await User.create({
            name: 'Sarah Code',
            email: 'sarah@example.com',
            password: hashedPassword,
            role: 'developer'
        });

        const developer3 = await User.create({
            name: 'Mike Builder',
            email: 'mike@example.com',
            password: hashedPassword,
            role: 'developer'
        });

        // 4. Create OnCampusERP Client
        const oncampusUser = await User.create({
            name: 'OnCampus ERP',
            email: 'admin@oncampuserp.com',
            password: clientPassword,
            role: 'client',
            gstin: '29AAHCG9999K1Z5',
            address: 'Tech Park, Bangalore'
        });

        console.log('Users created');

        // 2. Create Websites
        const website1 = await Website.create({
            name: 'Acme Corp Main Site',
            url: 'https://acme.example.com',
            client: client1._id,
            developers: [developer1._id, developer2._id],
            seoHealthScore: 85,
            seoData: {
                title: 'Acme Corp - Leaders in Innovation',
                description: 'We enable future technologies.',
                h1: ['Welcome to Acme Corp'],
                ogImage: 'https://via.placeholder.com/1200x630',
                loadTime: 850
            },
            lastSeoScan: new Date()
        });

        const website2 = await Website.create({
            name: 'Acme E-Commerce',
            url: 'https://shop.acme.example.com',
            client: client1._id,
            developers: [developer2._id, developer3._id],
            seoHealthScore: 72,
            seoData: {
                title: 'Acme Shop - Premium Products',
                description: 'Shop the best products online.',
                h1: ['Shop Now'],
                ogImage: 'https://via.placeholder.com/1200x630',
                loadTime: 1200
            },
            lastSeoScan: new Date()
        });

        const website3 = await Website.create({
            name: 'TechStart Platform',
            url: 'https://techstart.example.com',
            client: client2._id,
            developers: [developer1._id, developer3._id],
            seoHealthScore: 91,
            seoData: {
                title: 'TechStart - Innovation Platform',
                description: 'Building the future of tech.',
                h1: ['Welcome to TechStart'],
                ogImage: 'https://via.placeholder.com/1200x630',
                loadTime: 650
            },
            lastSeoScan: new Date()
        });

        const websiteOnCampus = await Website.create({
            name: 'OnCampus ERP',
            url: 'https://www.oncampuserp.com',
            client: oncampusUser._id,
            developers: [developer1._id, developer2._id],
            seoHealthScore: 88,
            seoData: {
                title: 'OnCampus ERP - Best College Management Software',
                description: 'Comprehensive ERP solution for educational institutions.',
                h1: ['Transform Your Campus Management'],
                ogImage: 'https://www.oncampuserp.com/og-image.jpg',
                loadTime: 750
            },
            lastSeoScan: new Date(),
            config: {
                gaPropertyId: 'GA-123456789'
            }
        });

        console.log('Websites created');

        // 3. Create Work Logs and Action Items (40+ entries)
        const now = new Date();
        const workLogs = [];

        // Today - Mix of activities
        workLogs.push({
            developer: developer1._id,
            website: website1._id,
            type: 'log',
            description: 'Implemented responsive navigation menu with hamburger toggle for mobile devices. Added smooth animations and fixed z-index issues.',
            durationMinutes: 90,
            tags: ['frontend', 'responsive'],
            createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
            isStarred: true
        });

        workLogs.push({
            developer: developer2._id,
            website: website2._id,
            type: 'action',
            title: 'Approve new payment gateway integration',
            description: 'We have integrated Stripe payment gateway with support for credit cards, Apple Pay, and Google Pay. Ready for review.',
            status: 'pending',
            tags: ['payment', 'integration'],
            createdAt: new Date(now - 3 * 60 * 60 * 1000) // 3 hours ago
        });

        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'log',
            description: 'Fixed critical bug in user authentication flow causing session timeouts. Updated JWT token refresh logic.',
            durationMinutes: 120,
            tags: ['bugfix', 'security', 'backend'],
            createdAt: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
            isStarred: true
        });

        workLogs.push({
            developer: developer1._id,
            website: website3._id,
            type: 'log',
            description: 'Optimized database queries for dashboard analytics. Reduced load time from 3.2s to 0.8s.',
            durationMinutes: 150,
            tags: ['performance', 'database'],
            createdAt: new Date(now - 5 * 60 * 60 * 1000) // 5 hours ago
        });

        workLogs.push({
            developer: developer2._id,
            website: website1._id,
            type: 'action',
            title: 'Review new homepage design mockups',
            description: 'Updated homepage design with modern layout, hero section with video background, and improved call-to-action buttons. Please review attached mockups.',
            status: 'approved',
            clientResponse: 'Looks amazing! Love the new hero section. Please proceed with implementation.',
            tags: ['design', 'ui/ux'],
            createdAt: new Date(now - 6 * 60 * 60 * 1000) // 6 hours ago
        });

        // Yesterday
        workLogs.push({
            developer: developer3._id,
            website: website2._id,
            type: 'log',
            description: 'Implemented product search with filters (category, price range, ratings). Added autocomplete suggestions.',
            durationMinutes: 180,
            tags: ['feature', 'search', 'frontend'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // Yesterday, 2h offset
            isStarred: false
        });

        workLogs.push({
            developer: developer1._id,
            website: website1._id,
            type: 'log',
            description: 'Set up CI/CD pipeline with GitHub Actions. Automated testing and deployment to staging environment.',
            durationMinutes: 240,
            tags: ['devops', 'automation'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website2._id,
            type: 'action',
            title: 'Approve inventory management system',
            description: 'Completed inventory tracking system with real-time stock updates, low stock alerts, and automatic reorder suggestions.',
            status: 'approved',
            clientResponse: 'Excellent work! The auto-reorder feature will save us a lot of time.',
            tags: ['inventory', 'backend'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'log',
            description: 'Migrated email service from SendGrid to AWS SES. Updated all email templates with new branding.',
            durationMinutes: 90,
            tags: ['email', 'migration'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer1._id,
            website: website2._id,
            type: 'log',
            description: 'Added product image zoom functionality and image gallery lightbox. Improved mobile image viewing experience.',
            durationMinutes: 75,
            tags: ['frontend', 'ui/ux'],
            createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000)
        });

        // 2 days ago
        workLogs.push({
            developer: developer2._id,
            website: website1._id,
            type: 'action',
            title: 'Update privacy policy and cookie banner',
            description: 'Need approval for GDPR-compliant cookie consent banner and updated privacy policy to comply with latest regulations.',
            status: 'rejected',
            clientResponse: 'Please revise - we need more granular cookie categories and clearer opt-out options.',
            tags: ['legal', 'compliance'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'log',
            description: `I modified AuthContext.jsx to correctly manage and expose the token in the context value. This ensures WebsiteContext.jsx receives the token effectively, allowing it to fetch website data and populating the dropdown.
            
Files Edited:
1. AuthContext.jsx
2. ProgressUpdates.jsx
3. Caching AuthContext
4. Fixing AuthContext

Notifying user about the fix I've fixed the issue causing the blank page.

The Problem: The application was failing to pass your login token to the website data fetcher, resulting in "No active websites found" because it thought you weren't authorized.`,
            durationMinutes: 180,
            tags: ['bugfix', 'auth', 'critical'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000),
            isStarred: true
        });

        workLogs.push({
            developer: developer1._id,
            website: website1._id,
            type: 'log',
            description: 'Implemented user activity tracking and analytics dashboard. Added charts for page views, user engagement, and conversion rates.',
            durationMinutes: 210,
            tags: ['analytics', 'dashboard'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website2._id,
            type: 'log',
            description: 'Added customer reviews and ratings system. Users can now rate products and leave detailed reviews with photos.',
            durationMinutes: 165,
            tags: ['feature', 'reviews'],
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000)
        });

        // 3 days ago
        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'action',
            title: 'Launch new API v2 endpoints',
            description: 'New RESTful API with improved performance, better documentation, and GraphQL support. Ready for production deployment.',
            status: 'pending',
            tags: ['api', 'backend'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer1._id,
            website: website2._id,
            type: 'log',
            description: 'Integrated shipping API with UPS, FedEx, and USPS. Added real-time shipping rate calculation at checkout.',
            durationMinutes: 195,
            tags: ['shipping', 'integration'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website1._id,
            type: 'log',
            description: 'Updated all dependencies to latest stable versions. Fixed security vulnerabilities reported by npm audit.',
            durationMinutes: 60,
            tags: ['security', 'maintenance'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website2._id,
            type: 'action',
            title: 'Approve multi-currency support',
            description: 'Added support for 15+ currencies with automatic conversion rates. Users can shop in their preferred currency.',
            status: 'approved',
            clientResponse: 'Perfect timing! This will help us expand internationally. Green light to deploy.',
            tags: ['i18n', 'payments'],
            createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000)
        });

        // 4 days ago  
        workLogs.push({
            developer: developer1._id,
            website: website3._id,
            type: 'log',
            description: 'Refactored codebase to use TypeScript. Improved type safety and developer experience.',
            durationMinutes: 360,
            tags: ['refactor', 'typescript'],
            createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website1._id,
            type: 'log',
            description: 'Created comprehensive API documentation using Swagger/OpenAPI. Added interactive examples and try-it-out feature.',
            durationMinutes: 120,
            tags: ['documentation', 'api'],
            createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website2._id,
            type: 'log',
            description: 'Implemented abandoned cart recovery email system. Automated emails sent 1h, 24h, and 72h after cart abandonment.',
            durationMinutes: 135,
            tags: ['email', 'automation', 'marketing'],
            createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000)
        });

        // 5 days ago
        workLogs.push({
            developer: developer1._id,
            website: website1._id,
            type: 'action',
            title: 'New blog section design approval',
            description: 'Designed new blog section with category filtering, featured posts, and newsletter signup. Modern card-based layout.',
            status: 'approved',
            clientResponse: 'Love the clean design! The newsletter signup placement is perfect.',
            tags: ['design', 'blog'],
            createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website3._id,
            type: 'log',
            description: 'Added Redis caching for frequently accessed data. API response time improved by 60%.',
            durationMinutes: 150,
            tags: ['performance', 'caching'],
            createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000),
            isStarred: true
        });

        workLogs.push({
            developer: developer3._id,
            website: website2._id,
            type: 'log',
            description: 'Built admin dashboard for order management. Added filters, bulk actions, and export to CSV functionality.',
            durationMinutes: 270,
            tags: ['admin', 'dashboard'],
            createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000)
        });

        // 6 days ago
        workLogs.push({
            developer: developer1._id,
            website: website2._id,
            type: 'log',
            description: 'Implemented wishlist feature. Users can save products and receive notifications when items go on sale.',
            durationMinutes: 105,
            tags: ['feature', 'wishlist'],
            createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website1._id,
            type: 'log',
            description: 'Fixed SEO issues: added meta descriptions, improved heading structure, and implemented schema markup.',
            durationMinutes: 90,
            tags: ['seo', 'optimization'],
            createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'action',
            title: 'Mobile app beta testing approval',
            description: 'React Native mobile app completed with offline support, push notifications, and biometric authentication. Ready for beta testing.',
            status: 'pending',
            tags: ['mobile', 'react-native'],
            createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000)
        });

        // 7 days ago
        workLogs.push({
            developer: developer1._id,
            website: website1._id,
            type: 'log',
            description: 'Added social media sharing buttons and Open Graph meta tags. Improved social media preview cards.',
            durationMinutes: 45,
            tags: ['social', 'frontend'],
            createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer2._id,
            website: website2._id,
            type: 'log',
            description: 'Implemented promotional codes and discount system. Support for percentage off, fixed amount, and BOGO deals.',
            durationMinutes: 180,
            tags: ['feature', 'promotions'],
            createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000)
        });

        workLogs.push({
            developer: developer3._id,
            website: website3._id,
            type: 'log',
            description: 'Set up automated backup system with daily snapshots and 30-day retention. Tested restore procedures.',
            durationMinutes: 120,
            tags: ['devops', 'backup'],
            createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000)
        });

        // Add 15 days of dummy data for OnCampusERP
        const activityTypes = ['log', 'action'];
        const developers = [developer1, developer2, developer3];
        const tagsList = ['frontend', 'backend', 'database', 'api', 'ui/ux', 'bugfix', 'feature', 'testing'];

        for (let i = 0; i < 15; i++) {
            // Add 1-3 logs per day
            const logsPerDay = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < logsPerDay; j++) {
                const isAction = Math.random() > 0.7;
                const dev = developers[Math.floor(Math.random() * developers.length)];

                workLogs.push({
                    developer: dev._id,
                    website: websiteOnCampus._id,
                    type: isAction ? 'action' : 'log',
                    title: isAction ? `Approval needed for ${tagsList[Math.floor(Math.random() * tagsList.length)]} update` : undefined,
                    description: isAction
                        ? 'We have completed the implementation and need your sign-off to proceed to production.'
                        : `Implemented improvements to the ${tagsList[Math.floor(Math.random() * tagsList.length)]} module. Optimized performance and fixed reported issues.`,
                    status: isAction ? (Math.random() > 0.5 ? 'approved' : 'pending') : undefined,
                    durationMinutes: Math.floor(Math.random() * 180) + 30,
                    tags: [tagsList[Math.floor(Math.random() * tagsList.length)], tagsList[Math.floor(Math.random() * tagsList.length)]],
                    createdAt: new Date(now - i * 24 * 60 * 60 * 1000 - Math.floor(Math.random() * 10) * 60 * 60 * 1000)
                });
            }
        }

        await WorkLog.create(workLogs);

        console.log(`Created ${workLogs.length} work logs and action items`);
        console.log('-----------------------------------');
        console.log('Client OnFees: info@onfees.com / 12345678');
        console.log('Admin: admin@example.com / 123456');
        console.log('Client 1: client@example.com / 12345678');
        console.log('Client 2: techstart@example.com / 12345678');
        console.log('OnCampus: admin@oncampuserp.com / 12345678');
        console.log('Dev 1: dev@example.com / 123456');
        console.log('Dev 2: sarah@example.com / 123456');
        console.log('Dev 3: mike@example.com / 123456');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();

