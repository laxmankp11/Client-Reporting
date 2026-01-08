const cron = require('node-cron');
const Website = require('./models/Website');
const { runScan } = require('./controllers/seoController');

const startCronJobs = () => {
    console.log('Initializing Cron Jobs...');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily SEO scan...');
        try {
            const websites = await Website.find({});
            console.log(`Found ${websites.length} websites to scan.`);

            for (const website of websites) {
                try {
                    await runScan(website);
                    console.log(`Scanned ${website.name}`);
                } catch (error) {
                    console.error(`Failed to scan ${website.name}:`, error.message);
                }
            }
            console.log('Daily scan completed.');
        } catch (error) {
            console.error('Error in daily scan job:', error);
        }
    });
};

module.exports = startCronJobs;
