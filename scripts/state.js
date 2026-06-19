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
    
    // Check if the key exists in localStorage to see if a session has ever been initialized
    const hasExistingStorage = localStorage.getItem('campus_life_planner_records') !== null;

    // FIX: If the user has a save file OR if storedRecords contains an array (even an empty one)
    if (hasExistingStorage || (Array.isArray(storedRecords) && storedRecords.length === 0)) {
        // Respect the empty slate! Do NOT load seed data.
        records = storedRecords || [];
    } else if (defaultSeedData && defaultSeedData.length > 0) {
        // Only seed data if this is a completely brand-new user with absolutely zero data history
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

/**
 * Generates an aggregated list of total minutes tracked over a fixed Sunday - Saturday week.
 * @param {Array} dynamicRecords - The current list of tasks passed from the UI
 * @returns {Array} Array of 7 objects representing Sun - Sat with total calculated minutes
 */
export function getLast7DaysTrendData(dynamicRecords = []) {
    const outputs = [];
    const today = new Date();
    
    // Get the current day of the week (0 for Sunday, 1 for Monday, etc.)
    const currentDayOfWeek = today.getDay(); 
    
    // Calculate the date of the most recent Sunday
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - currentDayOfWeek);

    // Build the week forward from Sunday to Saturday
    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(startSunday);
        targetDate.setDate(startSunday.getDate() + i);
        
        // Format date string to match your records format (YYYY-MM-DD)
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        // Format short weekday string label (e.g., "Sun", "Mon", "Tue")
        const displayLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Calculate the aggregate minutes for this specific day
        const totalMinutes = dynamicRecords
            .filter(rec => rec.date === dateString)
            .reduce((sum, rec) => sum + (parseInt(rec.duration, 10) || 0), 0);
            
        outputs.push({
            displayLabel,
            totalMinutes
        });
    }
    
    return outputs;
}