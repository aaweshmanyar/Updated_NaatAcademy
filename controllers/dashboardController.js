const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'Update_naatacademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

exports.getDashboardStats = async (req, res) => {
    try {
        // Get counts for all entities
        const [articleCount] = await pool.query('SELECT COUNT(*) as count FROM Article WHERE IsDeleted = 0');
        const [writerCount] = await pool.query('SELECT COUNT(*) as count FROM Writer WHERE IsDeleted = 0');
        const [kalaamCount] = await pool.query('SELECT COUNT(*) as count FROM Kalaam WHERE IsDeleted = 0');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM Book WHERE IsDeleted = 0');
        const [sectionCount] = await pool.query('SELECT COUNT(*) as count FROM Section WHERE IsDeleted = 0');
        const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM Category WHERE IsDeleted = 0');
        const [groupCount] = await pool.query('SELECT COUNT(*) as count FROM `Groups` WHERE IsDeleted = 0');
        const [topicCount] = await pool.query('SELECT COUNT(*) as count FROM Topic WHERE IsDeleted = 0');

        const stats = {
            articles: articleCount[0].count,
            writers: writerCount[0].count,
            poetry: kalaamCount[0].count,
            books: bookCount[0].count,
            sections: sectionCount[0].count,
            categories: categoryCount[0].count,
            groups: groupCount[0].count,
            topics: topicCount[0].count
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        // Get recent activity across all content types
        const [recentActivity] = await pool.query(`
            (SELECT 
                'poetry' as type,
                k.Title as title,
                w.Name as author,
                c.Name as category,
                k.CreatedOn as createdDate,
                DATE_FORMAT(k.CreatedOn, '%m/%d/%Y') as date
            FROM Kalaam k
            LEFT JOIN Writer w ON k.WriterID = w.WriterID
            LEFT JOIN Category c ON k.CategoryID = c.CategoryID
            WHERE k.IsDeleted = 0)
            UNION ALL
            (SELECT 
                'book' as type,
                b.Title as title,
                w.Name as author,
                c.Name as category,
                b.CreatedOn as createdDate,
                DATE_FORMAT(b.CreatedOn, '%m/%d/%Y') as date
            FROM Book b
            LEFT JOIN Writer w ON b.WriterID = w.WriterID
            LEFT JOIN Category c ON b.CategoryID = c.CategoryID
            WHERE b.IsDeleted = 0)
            UNION ALL
            (SELECT 
                'article' as type,
                a.Title as title,
                w.Name as author,
                c.Name as category,
                a.CreatedOn as createdDate,
                DATE_FORMAT(a.CreatedOn, '%m/%d/%Y') as date
            FROM Article a
            LEFT JOIN Writer w ON a.WriterID = w.WriterID
            LEFT JOIN Category c ON a.CategoryID = c.CategoryID
            WHERE a.IsDeleted = 0)
            ORDER BY createdDate DESC
            LIMIT 3
        `);

        // Group the results by type
        const groupedActivity = {
            poetry: recentActivity.filter(item => item.type === 'poetry').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            })),
            books: recentActivity.filter(item => item.type === 'book').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            })),
            articles: recentActivity.filter(item => item.type === 'article').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            }))
        };

        res.json({ success: true, recentActivity: groupedActivity });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ success: false, message: 'Error fetching recent activity', error: error.message });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        // Get both stats and recent activity
        const [articleCount] = await pool.query('SELECT COUNT(*) as count FROM Article WHERE IsDeleted = 0');
        const [writerCount] = await pool.query('SELECT COUNT(*) as count FROM Writer WHERE IsDeleted = 0');
        const [kalaamCount] = await pool.query('SELECT COUNT(*) as count FROM Kalaam WHERE IsDeleted = 0');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM Book WHERE IsDeleted = 0');
        const [sectionCount] = await pool.query('SELECT COUNT(*) as count FROM Section WHERE IsDeleted = 0');
        const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM Category WHERE IsDeleted = 0');
        const [groupCount] = await pool.query('SELECT COUNT(*) as count FROM `Groups` WHERE IsDeleted = 0');
        const [topicCount] = await pool.query('SELECT COUNT(*) as count FROM Topic WHERE IsDeleted = 0');

        // Get recent activity across all content types
        const [recentActivity] = await pool.query(`
            (SELECT 
                'poetry' as type,
                k.Title as title,
                w.Name as author,
                c.Name as category,
                k.CreatedOn as createdDate,
                DATE_FORMAT(k.CreatedOn, '%m/%d/%Y') as date
            FROM Kalaam k
            LEFT JOIN Writer w ON k.WriterID = w.WriterID
            LEFT JOIN Category c ON k.CategoryID = c.CategoryID
            WHERE k.IsDeleted = 0)
            UNION ALL
            (SELECT 
                'book' as type,
                b.Title as title,
                w.Name as author,
                c.Name as category,
                b.CreatedOn as createdDate,
                DATE_FORMAT(b.CreatedOn, '%m/%d/%Y') as date
            FROM Book b
            LEFT JOIN Writer w ON b.WriterID = w.WriterID
            LEFT JOIN Category c ON b.CategoryID = c.CategoryID
            WHERE b.IsDeleted = 0)
            UNION ALL
            (SELECT 
                'article' as type,
                a.Title as title,
                w.Name as author,
                c.Name as category,
                a.CreatedOn as createdDate,
                DATE_FORMAT(a.CreatedOn, '%m/%d/%Y') as date
            FROM Article a
            LEFT JOIN Writer w ON a.WriterID = w.WriterID
            LEFT JOIN Category c ON a.CategoryID = c.CategoryID
            WHERE a.IsDeleted = 0)
            ORDER BY createdDate DESC
            LIMIT 3
        `);

        // Group the results by type
        const groupedActivity = {
            poetry: recentActivity.filter(item => item.type === 'poetry').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            })),
            books: recentActivity.filter(item => item.type === 'book').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            })),
            articles: recentActivity.filter(item => item.type === 'article').map(item => ({
                title: item.title,
                author: item.author,
                category: item.category,
                date: item.date
            }))
        };

        const dashboardData = {
            stats: {
                articles: articleCount[0].count,
                writers: writerCount[0].count,
                poetry: kalaamCount[0].count,
                books: bookCount[0].count,
                sections: sectionCount[0].count,
                categories: categoryCount[0].count,
                groups: groupCount[0].count,
                topics: topicCount[0].count
            },
            recentActivity: groupedActivity
        };

        res.json({ success: true, data: dashboardData });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
    }
}; 