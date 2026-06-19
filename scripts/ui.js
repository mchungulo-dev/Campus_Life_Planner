import { getLast7DaysTrendData } from './state.js';

/**
 * Aggregates duration totals and injects a 7-day flexbox column chart into the DOM
 * @param {Array} records - The raw list of task tracking records from application state
 */
export function renderWeeklyTrendChart(records) {
    const chartContainer = document.getElementById('bar-chart-container');
    if (!chartContainer) return;

    // 1. Process data metrics across the moving calendar window
    const weeklyMetrics = getLast7DaysTrendData(records);

    // 2. Identify highest recording to establish proportional bar scales (Floor at 60 mins)
    const peakValue = Math.max(...weeklyMetrics.map(day => day.totalMinutes), 60);

    // 3. Construct and insert structural markup
    chartContainer.innerHTML = weeklyMetrics.map(day => {
        const structuralHeight = Math.min((day.totalMinutes / peakValue) * 100, 100);
        
        return `
            <div class="chart-column-wrapper">
                <div class="chart-value-bubble">${day.totalMinutes}m</div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="height: ${structuralHeight}%"></div>
                </div>
                <div class="chart-axis-label">${day.displayLabel}</div>
            </div>
        `;
    }).join('');
}