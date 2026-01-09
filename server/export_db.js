require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/User');
const Website = require('./models/Website');
const WorkLog = require('./models/WorkLog');
const Message = require('./models/Message');
const DailyStat = require('./models/DailyStat');
const SystemConfig = require('./models/SystemConfig');

const connectDB = require('./config/db');

const exportData = async () => {
    try {
        await connectDB();

        const outputDir = path.join(__dirname, '..', 'database_dump');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log('Exporting data...');

        const collections = [
            { name: 'users', model: User },
            { name: 'websites', model: Website },
            { name: 'worklogs', model: WorkLog },
            { name: 'messages', model: Message },
            { name: 'daily_stats', model: DailyStat },
            { name: 'system_configs', model: SystemConfig }
        ];

        for (const col of collections) {
            const data = await col.model.find({});
            fs.writeFileSync(
                path.join(outputDir, `${col.name}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`Exported ${data.length} ${col.name}`);
        }

        console.log('Data export completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Export failed:', error);
        process.exit(1);
    }
};

exportData();
