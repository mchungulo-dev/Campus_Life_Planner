// 1. Title/Description Validation
const TITLE_REGEX = /^\S(?:.*\S)?$/;

// 2. Duration Validation 
const DURATION_REGEX = /^(0|[1-9]\d*)$/;

// 3. Date Validation 
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// 4. Tag Validation 
const TAG_REGEX = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// 5. Duplicate Word Detection 
const DUPLICATE_WORD_REGEX = /\b(\w+)\s+\1\b/i;


/**
 * Validates the task title.
 * @param {string} title 
 * @returns {boolean}
 */
export function validateTitle(title) {
    if (typeof title !== 'string') return false;
    return TITLE_REGEX.test(title);
}

/**
 * Validates that duration is a positive whole number.
 * @param {string|number} duration 
 * @returns {boolean}
 */
export function validateDuration(duration) {
    const stringDuration = String(duration).trim();
    return DURATION_REGEX.test(stringDuration) && stringDuration !== '0';
}

/**
 * Validates the planning calendar execution stamp.
 * @param {string} date 
 * @returns {boolean}
 */
export function validateDate(date) {
    if (typeof date !== 'string') return false;
    return DATE_REGEX.test(date.trim());
}

/**
 * Validates categorization focus tags.
 * @param {string} tag 
 * @returns {boolean}
 */
export function validateTag(tag) {
    if (typeof tag !== 'string') return false;
    return TAG_REGEX.test(tag.trim());
}

/**
 * Advanced Check: Scans text for accidental duplicate word sequences.
 * @param {string} text 
 * @returns {boolean} True if duplicate words ARE found, false if clean.
 */
export function hasDuplicateWords(text) {
    if (typeof text !== 'string') return false;
    return DUPLICATE_WORD_REGEX.test(text);
}

/**
 * Comprehensive structural validation check for importing JSON data.
 * Ensures an imported record matches the blueprint perfectly before application injection.
 * @param {Object} record 
 * @returns {boolean}
 */
export function validateImportedRecord(record) {
    if (!record || typeof record !== 'object') return false;
    
    return (
        typeof record.id === 'string' &&
        validateTitle(record.title) &&
        validateDuration(record.duration) &&
        validateTag(record.tag) &&
        validateDate(record.date) &&
        typeof record.createdAt === 'string' &&
        typeof record.updatedAt === 'string'
    );
}