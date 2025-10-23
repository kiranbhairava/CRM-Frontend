/**
 * Enhanced Leads Filtering
 * Adds additional filtering options to the leads page:
 * - Lead source filter
 * - Course interest filter
 * - Assigned to filter (admin only)
 */

// Global variables to track filter state
let filterSource = '';
let filterCourse = '';
let filterAssignedTo = '';

// Enhanced filter application function
function enhancedApplyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = allLeads;

    // Status filter (existing)
    if (currentFilter !== 'all') {
        filtered = filtered.filter(lead => lead.status === currentFilter);
    }

    // Source filter (new)
    if (filterSource) {
        filtered = filtered.filter(lead => lead.lead_source === filterSource);
    }

    // Course filter (new)
    if (filterCourse) {
        filtered = filtered.filter(lead => lead.course_interested_in === filterCourse);
    }

    // Assigned To filter (new)
    if (filterAssignedTo) {
        filtered = filtered.filter(lead => lead.assigned_to == filterAssignedTo);
    }

    // Search text (existing)
    if (searchTerm) {
        filtered = filtered.filter(lead => 
            (lead.first_name && lead.first_name.toLowerCase().includes(searchTerm)) ||
            (lead.last_name && lead.last_name.toLowerCase().includes(searchTerm)) ||
            (lead.email_address && lead.email_address.toLowerCase().includes(searchTerm)) ||
            (lead.mobile_number && lead.mobile_number.includes(searchTerm))
        );
    }

    currentPage = 1;
    renderLeads(filtered);
}

// Function to set up additional filters UI
function setupEnhancedFilters() {
    // Create the additional filter UI elements
    const filterContainer = document.querySelector('.bg-white.rounded-xl.shadow-sm.p-6.mb-6 .flex.flex-col');
    
    // Create row for additional filters
    const additionalFilters = document.createElement('div');
    additionalFilters.className = 'flex flex-wrap gap-4 mt-4';
    
    // Source Filter
    const sourceFilterDiv = document.createElement('div');
    sourceFilterDiv.className = 'flex-1 min-w-[150px]';
    sourceFilterDiv.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
        <select id="sourceFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Sources</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Existing Customer">Existing Customer</option>
            <option value="Self Generated">Self Generated</option>
            <option value="Employee">Employee</option>
            <option value="Partner">Partner</option>
            <option value="Public Relations">Public Relations</option>
            <option value="Direct Mail">Direct Mail</option>
            <option value="Conference">Conference</option>
            <option value="Trade Show">Trade Show</option>
            <option value="Website">Website</option>
            <option value="Word of Mouth">Word of Mouth</option>
            <option value="Email">Email</option>
            <option value="Campaign">Campaign</option>
            <option value="Other">Other</option>
        </select>
    `;
    
    // Course Filter
    const courseFilterDiv = document.createElement('div');
    courseFilterDiv.className = 'flex-1 min-w-[150px]';
    courseFilterDiv.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 mb-1">Course Interest</label>
        <select id="courseFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Courses</option>
        </select>
    `;
    
    // Assigned To Filter
    const assignedFilterDiv = document.createElement('div');
    assignedFilterDiv.className = 'flex-1 min-w-[150px]';
    assignedFilterDiv.innerHTML = `
        <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
        <select id="assignedToFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Sales Managers</option>
        </select>
    `;
    
    // Clear Filters Button
    const clearFilterDiv = document.createElement('div');
    clearFilterDiv.className = 'flex items-end';
    clearFilterDiv.innerHTML = `
        <button id="clearFilters" class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
            Clear Filters
        </button>
    `;
    
    // Add all filter elements to the container
    additionalFilters.appendChild(sourceFilterDiv);
    additionalFilters.appendChild(courseFilterDiv);
    additionalFilters.appendChild(assignedFilterDiv);
    additionalFilters.appendChild(clearFilterDiv);
    
    // Add the additional filters to the main filter container
    filterContainer.appendChild(additionalFilters);
    
    // Set up event listeners for the new filters
    document.getElementById('sourceFilter').addEventListener('change', function() {
        filterSource = this.value;
        enhancedApplyFilters();
    });
    
    document.getElementById('courseFilter').addEventListener('change', function() {
        filterCourse = this.value;
        enhancedApplyFilters();
    });
    
    document.getElementById('assignedToFilter').addEventListener('change', function() {
        filterAssignedTo = this.value;
        enhancedApplyFilters();
    });
    
    document.getElementById('clearFilters').addEventListener('click', function() {
        // Clear all filter values
        document.getElementById('sourceFilter').value = '';
        document.getElementById('courseFilter').value = '';
        document.getElementById('assignedToFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        // Reset filter variables
        filterSource = '';
        filterCourse = '';
        filterAssignedTo = '';
        
        // Reset status filter
        filterByStatus('all');
    });
}

// Function to populate filter dropdowns with unique values from leads
function populateFilterDropdowns() {
    // Get unique course interests
    const courseFilter = document.getElementById('courseFilter');
    const uniqueCourses = [...new Set(allLeads
        .filter(lead => lead.course_interested_in)
        .map(lead => lead.course_interested_in))];
    
    uniqueCourses.sort().forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });
    
    // Get assigned users (sales managers)
    const assignedFilter = document.getElementById('assignedToFilter');
    
    // Fetch sales managers if user is admin
    if (currentUser && currentUser.role === 'ADMIN') {
        apiRequest('/sales-managers')
            .then(managers => {
                managers.forEach(manager => {
                    const option = document.createElement('option');
                    option.value = manager.id;
                    option.textContent = manager.name;
                    assignedFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Failed to load sales managers:', error));
    } else {
        // Hide the assigned filter for non-admin users
        document.getElementById('assignedToFilter').closest('div').style.display = 'none';
    }
}

// Override the original filterLeads function to use the enhanced version
function filterLeads() {
    enhancedApplyFilters();
}

// Update init function to include our enhanced filters
const originalInit = init;
init = async function() {
    await originalInit();
    setupEnhancedFilters();
    populateFilterDropdowns();
};

// Execute this script after the page is fully loaded
// This ensures all DOM elements and the original init function are available
document.addEventListener('DOMContentLoaded', function() {
    // The script will run automatically if added at the end of the HTML body
    // No additional initialization needed here
});