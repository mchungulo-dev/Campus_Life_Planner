import { getSavedRecords, saveRecords, getSavedSettings, saveSettings } from './storage.js';

// --- Global Application Memory State ---
let records = [];
let currentFilter = 'All';
let currentSort = 'date-asc'; // Options: date-asc, date-desc, duration-asc, duration-desc, title-az, title-za

// Default system configurations if brand new user session
let settings = {
    dailyCapacity: 480 // 8 hours baseline trackable limit
};

/**
 * Initializes app state by reading from storage or seeding default configurations.
 * @param {Array} defaultSeedData - The backup array parsed from seed.json
 */
export function initializeState(defaultSeedData = []) {
    // 1. Load configuration settings
    const storedSettings = getSavedSettings();
    if (storedSettings) {
        settings = storedSettings;
    } else {
        saveSettings(settings);
    }

    // 2. Load task data tracking entries
    const storedRecords = getSavedRecords();
    if (storedRecords && storedRecords.length > 0) {
        records = storedRecords;
    } else if (defaultSeedData && defaultSeedData.length > 0) {
        // First-time setup out-of-box experience seeding data array
        records = defaultSeedData;
        saveRecords(records);
    } else {
        records = [];
    }
}

/**
 * Returns all records matching current filter configurations in sorted sequence order.
 * @returns {Array} Processed and filtered record structures
 */
export function getProcessedRecords() {
    // Apply filtering rule
    let result = [...records];
    if (currentFilter !== 'All' && currentFilter !== 'all') {
        result = result.filter(rec => rec.tag.toLowerCase() === currentFilter.toLowerCase());
    }

    // Apply sorting rules
    result.sort((a, b) => {
        if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
        
        const durA = parseInt(a.duration, 10) || 0;
        const durB = parseInt(b.duration, 10) || 0;
        if (currentSort === 'duration-asc') return durA - durB;
        if (currentSort === 'duration-desc') return durB - durA;

        // Added support for Title string layout configurations
        if (currentSort === 'title-az') return a.title.localeCompare(b.title);
        if (currentSort === 'title-za') return b.title.localeCompare(a.title);
        
        return 0;
    });

    return result;
}

/**
 * Adds an entirely new task record entry into system memory tracking array.
 * @param {Object} rawRecordData 
 */
export function addRecord(rawRecordData) {
    const newRecord = {
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: rawRecordData.title.trim(),
        duration: parseInt(rawRecordData.duration, 10),
        tag: rawRecordData.tag.trim(),
        date: rawRecordData.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    records.push(newRecord);
    saveRecords(records);
    return newRecord;
}

/**
 * Updates an existing activity record by ID in live state memory and localStorage
 * @param {string} id - The unique identifier of the task
 * @param {Object} updatedData - The new values (title, duration, date, tag)
 * @returns {boolean} Status statement reflecting true on successful index match
 */
export function updateRecord(id, updatedData) {
    const index = records.findIndex(task => String(task.id) === String(id));
    if (index !== -1) {
        records[index] = {
            ...records[index],
            title: updatedData.title.trim(),
            duration: parseInt(updatedData.duration, 10),
            tag: updatedData.tag.trim(),
            date: updatedData.date,
            updatedAt: new Date().toISOString()
        };
        saveRecords(records); 
        return true;
    }
    return false;
}

/**
 * Removes a tracking item completely by searching ID.
 * @param {string} id 
 */
export function deleteRecord(id) {
    records = records.filter(rec => rec.id !== id);
    saveRecords(records);
}

/**
 * Updates filter matching keys.
 * @param {string} filterTag 
 */
export function setFilter(filterTag) {
    currentFilter = filterTag;
}

/**
 * Updates internal sorting keys.
 * @param {string} sortKey 
 */
export function setSort(sortKey) {
    currentSort = sortKey;
}

/**
 * Dynamically computes total duration aggregates split by specific day stamp groups.
 * @param {string} dateString 
 * @returns {number} Sum of minutes allocated
 */
export function getDailyTotalDuration(dateString) {
    return records
        .filter(rec => rec.date === dateString)
        .reduce((sum, rec) => sum + (parseInt(rec.duration, 10) || 0), 0);
}

/**
 * Simple getter for settings object properties.
 */
export function getSettings() {
    return { ...settings };
}

/**
 * Updates application layout daily threshold limits.
 * @param {number} newCapacity 
 */
export function updateDailyCapacity(newCapacity) {
    settings.dailyCapacity = parseInt(newCapacity, 10) || 480;
    saveSettings(settings);
}