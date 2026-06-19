import { renderWeeklyTrendChart } from './ui.js';

import { 
    validateTitle, 
    validateDuration, 
    validateDate, 
    validateTag, 
    hasDuplicateWords 
} from './validators.js';

import { 
    initializeState, 
    getProcessedRecords, 
    addRecord, 
    deleteRecord, 
    updateRecord, 
    setFilter, 
    setSort, 
    getDailyTotalDuration, 
    getSettings, 
    updateDailyCapacity 
} from './state.js';

// --- DOM Cache References ---
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.view-section');

// Form and Input Elements
const taskForm = document.getElementById('task-form');
const formRecordId = document.getElementById('form-record-id'); // Hidden tracker field
const formViewTitle = document.getElementById('form-view-title'); // Form heading element
const titleInput = document.getElementById('task-title');
const durationInput = document.getElementById('task-duration');
const dateInput = document.getElementById('task-date');
const tagSelect = document.getElementById('input-tag');

// Container Display Elements
const tableBody = document.getElementById('tasks-table-body');
const cardsContainer = document.getElementById('tasks-cards-container');

// Filter, Search, and Sort Inputs
const filterTagDropdown = document.getElementById('filter-tag');
const sortDropdown = document.getElementById('sort-dropdown');
const searchInput = document.getElementById('search-input');

/**
 * Stage 1: Single Page Application (SPA) Tab View Switcher
 */
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.getAttribute('data-target');

            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            sections.forEach(section => {
                if (section.id === targetView) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            // Reset form styling cleanly if a user leaves the edit state manually
            if (targetView !== 'form-view' && taskForm) {
                taskForm.reset();
                if (formRecordId) formRecordId.value = '';
                if (formViewTitle) formViewTitle.textContent = 'Schedule New Activity';
                const submitBtn = document.getElementById('form-submit-btn');
                if (submitBtn) submitBtn.textContent = 'Save Activity';
            }
        });
    });
}

/**
 * Stage 2: UI Render Engine
 */
function renderInterface() {
    let activeTasks = getProcessedRecords();

    // --- Live Regex Input Search Integration ---
    if (searchInput && searchInput.value.trim() !== '') {
        try {
            const query = searchInput.value.trim();
            const regex = new RegExp(query, 'i'); // Case-insensitive matching
            activeTasks = activeTasks.filter(task => regex.test(task.title) || regex.test(task.tag));
            
            const errorMsg = document.getElementById('regex-error-msg');
            if (errorMsg) errorMsg.hidden = true;
        } catch (e) {
            // Gracefully catch incomplete or broken regular expression strings
            const errorMsg = document.getElementById('regex-error-msg');
            if (errorMsg) errorMsg.hidden = false;
        }
    }

    if (tableBody) tableBody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    if (activeTasks.length === 0) {
        const fallbackHTML = `<tr><td colspan="5" style="text-align:center;">No tasks found. Add a new entry to get started!</td></tr>`;
        if (tableBody) tableBody.innerHTML = fallbackHTML;
        if (cardsContainer) cardsContainer.innerHTML = `<p class="placeholder-text" style="text-align:center; padding: 1rem;">No tasks available matching filters.</p>`;
        return;
    }

    activeTasks.forEach(task => {
        // Desktop Row with Edit and Delete Action buttons
        const rowHTML = `
            <tr id="row-${task.id}">
                <td><strong>${task.title}</strong></td>
                <td><span class="badge tag-${task.tag.toLowerCase()}">${task.tag}</span></td>
                <td>${task.duration} mins</td>
                <td>${task.date}</td>
                <td>
                    <button class="edit-btn action-icon" data-id="${task.id}" title="Edit Task" style="cursor:pointer; background:none; border:none; margin-right: 0.6rem;">✏️</button>
                    <button class="delete-btn action-icon" data-id="${task.id}" title="Delete Task" style="cursor:pointer; background:none; border:none;">🗑️</button>
                </td>
            </tr>
        `;
        if (tableBody) tableBody.insertAdjacentHTML('beforeend', rowHTML);

        // Mobile Card Stack View
        const cardHTML = `
            <div class="task-card card-${task.tag.toLowerCase()}" id="card-${task.id}" style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${task.title}</h3>
                    <span class="badge tag-${task.tag.toLowerCase()}">${task.tag}</span>
                </div>
                <div class="card-body" style="margin: 0.5rem 0;">
                    <p><strong>Duration:</strong> ${task.duration} minutes</p>
                    <p><strong>Scheduled:</strong> ${task.date}</p>
                </div>
                <div class="card-actions" style="display: flex; gap: 1rem;">
                    <button class="edit-btn card-action-edit" data-id="${task.id}" style="cursor:pointer; color: #b30059; background:none; border:none; font-weight:bold;">Edit</button>
                    <button class="delete-btn card-action-danger" data-id="${task.id}" style="cursor:pointer; color:red; background:none; border:none;">Delete Activity</button>
                </div>
            </div>
        `;
        if (cardsContainer) cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Attach dynamic click event listeners to Delete triggers
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this activity?")) {
                deleteRecord(taskId);
                renderInterface();
                updateDashboardMetrics();
            }
        });
    });

    // Attach dynamic click event listeners to Edit triggers
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            
            // Re-fetch clean records array to fill matching field info
            const rawTasks = getProcessedRecords();
            const targetTask = rawTasks.find(t => String(t.id) === String(taskId));

            if (targetTask) {
                // Populate Form Input values
                if (formRecordId) formRecordId.value = targetTask.id;
                if (titleInput) titleInput.value = targetTask.title;
                if (durationInput) durationInput.value = targetTask.duration;
                if (dateInput) dateInput.value = targetTask.date;
                if (tagSelect) tagSelect.value = targetTask.tag;

                // Adjust Form layout text strings to highlight modification view
                if (formViewTitle) formViewTitle.textContent = 'Edit Campus Activity Details';
                const submitBtn = document.getElementById('form-submit-btn');
                if (submitBtn) submitBtn.textContent = 'Update Activity';

                // Shift view directly into form view section
                const addFormBtn = document.querySelector('[data-target="form-view"]');
                if (addFormBtn) addFormBtn.click();
            }
        });
    });
}

/**
 * Stage 3: Form Submissions (Handles updates vs creation workflows natively)
 */
function initializeFormHandlers() {
    if (!taskForm) return;

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const rawTitle = titleInput.value.trim();
        const rawDuration = durationInput.value.trim();
        const rawDate = dateInput.value;
        const rawTag = tagSelect.value;
        const targetId = formRecordId ? formRecordId.value : '';

        if (!validateTitle(rawTitle) || hasDuplicateWords(rawTitle)) {
            alert("Invalid Task Title! Must be 5-100 characters, alphabet-focused, and contain no accidental duplicate words.");
            titleInput.focus();
            return;
        }

        if (!validateDuration(rawDuration)) {
            alert("Invalid Duration! Must be a positive whole number between 1 and 480 minutes.");
            durationInput.focus();
            return;
        }

        if (!validateDate(rawDate)) {
            alert("Invalid Date selection! Please pick a proper calendar date configuration.");
            dateInput.focus();
            return;
        }

        if (!validateTag(rawTag)) {
            alert("Please pick an authorized category tag cluster classification.");
            tagSelect.focus();
            return;
        }

        const taskData = {
            title: rawTitle,
            duration: parseInt(rawDuration, 10),
            date: rawDate,
            tag: rawTag
        };

        if (targetId) {
            updateRecord(targetId, taskData);
        } else {
            addRecord(taskData);
        }

        // Post Save Cleanup Configuration routines
        taskForm.reset();
        if (formRecordId) formRecordId.value = '';
        if (formViewTitle) formViewTitle.textContent = 'Schedule New Activity';
        const submitBtn = document.getElementById('form-submit-btn');
        if (submitBtn) submitBtn.textContent = 'Save Activity';

        renderInterface();
        updateDashboardMetrics();

        const workspaceBtn = document.querySelector('[data-target="workspace"]');
        if (workspaceBtn) workspaceBtn.click();
    });

    const cancelBtn = document.getElementById('form-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            taskForm.reset();
            if (formRecordId) formRecordId.value = '';
            const workspaceBtn = document.querySelector('[data-target="workspace"]');
            if (workspaceBtn) workspaceBtn.click();
        });
    }
}

/**
 * Stage 4: Sorting & Filtering Interactive Hooks
 */
function initializeDataControls() {
    if (filterTagDropdown) {
        filterTagDropdown.addEventListener('change', (e) => {
            setFilter(e.target.value);
            renderInterface();
        });
    }

    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            setSort(e.target.value);
            renderInterface();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderInterface();
        });
    }
}

/**
 * Stage 5: Live Dashboard Summary Recalculator
 */
function updateDashboardMetrics() {
    const tasks = getProcessedRecords();
    
    const totalTasksElem = document.getElementById('stat-total-tasks');
    const totalDurationElem = document.getElementById('stat-total-duration');
    const capProgressBar = document.getElementById('cap-progress-bar');
    const capTextDisplay = document.getElementById('cap-text-display');
    const topTagElem = document.getElementById('stat-top-tag');

    if (totalTasksElem) totalTasksElem.textContent = tasks.length;
    
    const totalMins = tasks.reduce((sum, task) => sum + parseInt(task.duration || 0, 10), 0);
    if (totalDurationElem) {
        totalDurationElem.innerHTML = `${totalMins} <span class="unit-label">mins</span>`;
    }

    if (topTagElem) {
        if (tasks.length === 0) {
            topTagElem.textContent = '—';
        } else {
            const counts = {};
            tasks.forEach(t => { if(t.tag) counts[t.tag] = (counts[t.tag] || 0) + 1; });
            const topTag = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '—');
            topTagElem.textContent = topTag;
        }
    }

    const maxLimit = 300; 
    const percentage = Math.min((totalMins / maxLimit) * 100, 100);
    if (capProgressBar) capProgressBar.style.width = `${percentage}%`;
    if (capTextDisplay) capTextDisplay.textContent = `${totalMins} / ${maxLimit} minutes used`;

    renderWeeklyTrendChart(tasks);
}

/**
 * Stage 6 & 7: Theme Controls & Data Export/Import/Reset Hooks
 */
function initializeSettingsControls() {
    const exportBtn = document.getElementById('btn-export-json');
    const importInput = document.getElementById('btn-import-json');
    const themeSelect = document.getElementById('theme-toggle-select');
    const resetBtn = document.getElementById('btn-reset-data'); // 👈 Cached Reset Button

    // --- 1. Load Saved Theme Preference on Page Load ---
    const activeSettings = getSettings() || {};
    if (activeSettings.theme) {
        if (themeSelect) themeSelect.value = activeSettings.theme;
        if (activeSettings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    // --- 2. Listen for Theme Swaps Live ---
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            if (selectedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }

            const runtimeSettings = getSettings() || {};
            runtimeSettings.theme = selectedTheme;
            localStorage.setItem('campus_life_planner_settings', JSON.stringify(runtimeSettings));
        });
    }

    // --- 3. Clear All Storage System Reset Trigger ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("🚨 WARNING: Are you absolutely sure you want to delete ALL application data, customized configurations, and logged campus activities? This action cannot be undone.")) {
                localStorage.clear(); // Clears all arrays and initialized flags instantly
                alert("🧹 Application clean slate achieved! System reloading...");
                window.location.reload(); // Hard reloads page to default initial states
            }
        });
    }

    // --- 4. JSON Export/Import Infrastructure ---
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const runtimeTasks = getProcessedRecords();
            const JSONStringStream = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(runtimeTasks, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", JSONStringStream);
            downloadAnchor.setAttribute("download", `campus_lifecycle_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    if (importInput) {
        importInput.addEventListener('change', (event) => {
            const uploadedFile = event.target.files[0];
            if (!uploadedFile) return;

            const streamReader = new FileReader();
            streamReader.onload = function(e) {
                try {
                    const parsedPayload = JSON.parse(e.target.result);
                    if (Array.isArray(parsedPayload)) {
                        if (confirm(`Do you want to import these ${parsedPayload.length} timeline tasks?`)) {
                            initializeState(parsedPayload);
                            renderWeeklyTrendChart(parsedPayload);
                            renderInterface();
                            updateDashboardMetrics();
                            alert("🎒 Backup dataset successfully loaded!");
                        }
                    } else {
                        alert("Invalid format. Backup file must contain a valid array matrix structure.");
                    }
                } catch (err) {
                    console.error("Import Debug Error Details:", err);
                    alert("Error processing file document. Please check your JSON file syntax formatting.");
                }
            };
            streamReader.readAsText(uploadedFile);
        });
    }
}

/**
 * Master Application Boot Sequence
 */
async function bootApplication() {
    let starterData = [];

    try {
        const response = await fetch('./seed.json');
        if (response.ok) {
            starterData = await response.json();
        }
    } catch (error) {
        console.warn("Could not load seed.json automatically, initializing clean storage state:", error);
    }

    initializeState(starterData);

    // Run core engine attachments natively
    initializeNavigation();
    initializeFormHandlers();
    initializeDataControls();
    initializeSettingsControls();
    renderInterface();
    updateDashboardMetrics();

    console.log("⚡ Campus Life Planner interface successfully booted!");
}

// Ensure execution loop loads correctly on document ready state
document.addEventListener('DOMContentLoaded', bootApplication);