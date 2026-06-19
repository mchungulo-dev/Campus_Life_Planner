
# Campus Life Planner

**GitHub Pages URL:**
https://mchungulo-dev.github.io/Campus_Life_Planner/

**Demo Video URL:** 
https://drive.google.com/file/d/14qR6TpRfmdpTeoiBfugh8LM3v4GZ06m0/view

---

##  Project Overview
The **Campus Life Planner** is a high-performance, fully responsive vanilla web workspace designed to help students track tasks, balance schedule durations, and analyze performance data benchmarks. Built strictly using standard web technologies, the application avoids heavy frameworks to showcase optimal DOM engineering, dynamic CSS variable themes, and structured JSON data portability workflows.

### Key Features
* **Dynamic Performance Metrics:** Live tracking of total tasks, cumulative duration, and top thematic focus tags.
* **Daily Capacity Allocation Guardrail:** An interactive progress indicator relative to custom user limitations.
* **Live RegEx Filtering Engine:** On-the-fly table querying utilizing advanced script expressions.
* **Data Portability Suite:** Full state isolation backup capability with instantaneous JSON ingestion and master reset mechanics.
* **Dual-State Contrast Themes:** Light and Dark view layouts optimized against ocular strain.

---

## System Architectural Theme
The interface leverages a semantic color mapping matrix that balance visual contrast and data clarity:
* **Light Mode Core:** Soft rose perimeter base (`#fff1f2`) combined with crisp white elevated layout surfaces (`#ffffff`) to allow operational components to pop.
* **Typography Accent:** Deep rich maroon-rose (`#4c0519`) for maximum readability hierarchy.
* **Dark Mode Override:** Deep midnight charcoal base (`#111827`) paired with muted dark-slate cards (`#1f2937`).

---

##  RegEx Engine Catalog
The filtering input field evaluates raw strings dynamically against structural target column data patterns:

| Filter Goal | RegEx Pattern | Sample Test Phrase Matched |
| :--- | :--- | :--- |
| **Strict Tag Isolation** | `^@tag:\w+` | Matches task lists precisely starting with `@tag:Academics` |
| **Numeric Duration Windows** | `\b\d{2,3}\b` | Matches absolute task periods within double or triple digits |
| **Boundary Strings** | `\b(Urgent\|Exam)\b` | Matches exact high-priority semantic markers inside task titles |

---

## Accessibility & Keyboard Navigation Map
The interface contains clear accessibility landmarks ensuring users can interact with elements via keyboard focus states:

* `Tab` / `Shift + Tab`: Cycles focus sequentially through structural interface controllers (Inputs, Selections, Form actions).
* `Space` / `Enter`: Activates focused UI elements, switches contextual menu views, and fires submission routines.
* `Escape`: Closes modal overlays or cancels active scheduling forms.
* **a11y Enhancements:** Explicit structural text association via semantic `<label for="...">` linking nodes and standard contrast controls.

---

## Operational Test Suites
To validate data parsing integrity and operational durability, execute these testing cycles manually:

1.  **Empty State Verification:** Wipe browser state parameters using **Reset App Data** to confirm default empty placeholders render layout cards uniformly.
2.  **Boundary Inputs:** Attempt to save empty tasks or zero-value properties to confirm system validation blocks anomalies.
3.  **JSON Portability Loop:** Generate structural task points, hit **Export JSON Backup**, verify download, reset system data state, and upload the saved backup to confirm exact reconstruction.

---

## References
Since some structural concepts are beyond what we learnt in class, here are the video lessons I watched to understand and implement the advanced logic utilized:

### 1. Advanced CSS Variables & Theme Architecture
* *Concept Used:* Re-mapping `:root` design tokens dynamically using global class toggling.
* *Learn Video:* [CSS Variables Tutorial by Kevin Powell](https://www.youtube.com/watch?v=PHO6TBq_auI)

### 2. LocalStorage Persistence & JSON Serialization
* *Concept Used:* Retaining active state dictionaries in browser memory strings across view reloads.
* *Learn Video:* [JavaScript LocalStorage & JSON Handling by Web Dev Simplified](https://www.youtube.com/watch?v=AUOzvInKVDE)

### 3. Regular Expressions (RegEx) Programming
* *Concept Used:* Compiling explicit pattern strings programmatically to intercept tabular list data indices.
* *Learn Video:* [Regular Expressions Regular Course by The Net Ninja](https://www.youtube.com/watch?v=r6I-Ahc0HB4)

### 4. Advanced Flexbox & Responsive Layout Containers
* *Concept Used:* Handling container shrink metrics, flex-wrapping parameters, and element spacing constraints cleanly.
* *Learn Video:* [Flexbox Layout Alignment Deep Dive by Traversy Media](https://www.youtube.com/watch?v=JJSoCx87OOM)

```
