const AIdata = require('../Models/aidata.js');

// Get all data
async function allData(req, res) {
    try {
        const data = await AIdata.find({});
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get specific data by EID
async function eidData(req, res) {
    const { eid } = req.query;
    try {
        const data = await AIdata.findOne({ eid });
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Delete all documents in the collection
async function deleteAllData(req, res) {
    try {
        await AIdata.deleteMany({});
        return res.json({ success: true, message: 'All data deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Insert 50 new documents with an additional 'cid' field
async function insertBulkData(req, res) {
    const bulkData = [];
    
    for (let i = 0; i < 1; i++) {
        bulkData.push({
            eid: `eid${Math.random().toString(36).substr(2, 7)}`, // Random EID
            remarks: "No follow-up needed", 
            satisfaction_score: i % 2 === 0 ? 1 : -1, // Alternate satisfaction scores
            sentiment_analysis: i % 2 === 0 ? "positive" : "negative", // Alternate sentiments
            call_summary: "Sample call summary", // Dummy summary
            call_text: "Sample call text", // Dummy call text
            cid: `cid${Math.random().toString(36).substr(2, 5)}` // Random CID
        });
    }

    try {
        await AIdata.insertMany(bulkData);
        return res.json({ success: true, message: '50 files inserted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    allData,
    eidData,
    deleteAllData,
    insertBulkData
};
