const STORAGE_KEY = 'campus_life_planner_records';
const SETTINGS_KEY = 'campus_life_planner_settings';

/**
 * Retrieves all saved task records from localStorage.
 * If no data exists, it returns an empty array.
 * @returns {Array} List of task objects
 */
export function getSavedRecords() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        return rawData ? JSON.parse(rawData) : [];
    } catch (error) {
        console.error("Failed to parse records from storage:", error);
        return [];
    }
}

/**
 * Overwrites the stored task records with a new updated list array.
 * @param {Array} records - The updated array of tasks to save
 */
export function saveRecords(records) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error("Failed to save records to storage:", error);
    }
}

/**
 * Retrieves user configuration settings (like daily capacity cap).
 * @returns {Object|null}
 */
export function getSavedSettings() {
    try {
        const rawSettings = localStorage.getItem(SETTINGS_KEY);
        return rawSettings ? JSON.parse(rawSettings) : null;
    } catch (error) {
        console.error("Failed to parse settings from storage:", error);
        return null;
    }
}

/**
 * Saves user configurations permanently.
 * @param {Object} settings 
 */
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings:", error);
    }
}

/**
 * Completely clears application footprint from the browser database module.
 */
export function clearAllStorage() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
}