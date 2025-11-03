// js/main.js

// ------------------------------------------------------------------
// Dynamic Project Loading Functions
// NOTE: These rely on the global 'projectData' array loaded from js/projectData.js
// ------------------------------------------------------------------

/**
 * Generates the HTML string for a single project/blog card.
 * @param {object} item - The project data object.
 * @param {string} assetPrefix - The path prefix (e.g., '', '../', or '../../') to correctly link assets.
 */
function generateCardHTML(item, assetPrefix = '') {
    const isBlog = item.type === 'blog';
    const linkText = isBlog ? 'Read Post' : 'Live Demo';
    // Link to the details page is corrected by the assetPrefix if used on a nested page (like pages/projects.html)
    const detailLink = item.detailsPage.startsWith('pages/') 
        ? item.detailsPage.replace('pages/', assetPrefix + 'pages/')
        : item.detailsPage;

    return `
        <div data-category="${item.type}" class="project-card rounded-xl overflow-hidden bg-[#1a152e] border border-gray-700/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-500">
            <div class="h-56 overflow-hidden">
                <img src="${assetPrefix}${item.imagePath}" alt="${item.title} Preview" class="w-full h-full object-cover">
            </div>
            <div class="p-6">
                <h3 class="text-2xl font-semibold mb-2 text-white">${item.title}</h3>
                <p class="text-gray-400 text-base mb-6 h-16 line-clamp-3">
                    ${item.description}
                </p>
                <div class="flex justify-between items-center pt-4 border-t border-gray-700/30">
                    <a href="${item.liveLink}" target="_blank" ${item.liveLink === '#' ? 'onclick="alert(\'Link coming soon!\'); return false;"' : ''} class="flex items-center text-blue-400 hover:text-white transition-colors duration-300">
                        ${linkText} <i data-feather="external-link" class="w-4 h-4 ml-2"></i>
                    </a>
                    <a href="${detailLink}" class="flex items-center text-gray-300 hover:text-white transition-colors group">
                        <span class="mr-1">Details</span>
                        <i data-feather="plus" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders project cards into the container, with an optional limit for the homepage snippet.
 * @param {number|null} limit - Maximum number of cards to display.
 * @param {string} assetPrefix - Path prefix for assets (e.g., '' for index.html, '../../' for pages/projects.html).
 */
function initializeProjectSection(limit = null, assetPrefix = '') {
    const container = document.getElementById('project-cards-container');
    // Ensure the container and data exist
    if (!container || typeof projectData === 'undefined') {
        console.error("Project data not loaded or container not found.");
        return;
    }

    // Limit the data array for the homepage snippet
    // Sort projects to show the newest ones (assuming newest are at the top of the array)
    const dataToRender = limit ? projectData.slice(0, limit) : projectData;

    // Generate and inject HTML
    container.innerHTML = dataToRender.map(item => generateCardHTML(item, assetPrefix)).join('');
    
    // Feather icons and filtering are re-initialized in the loadComponents loop/DOMContentLoaded
}

// Make globally accessible for pages/projects.html
window.initializeProjectSection = initializeProjectSection; 


// ------------------------------------------------------------------
// Main Component Loading Logic (Updated)
// ------------------------------------------------------------------
async function loadComponents() {
    const components = [
        'navbar', 'hero', 'about', 'experience', 'projects', 'contact', 'footer'
    ];
    
    for (const component of components) {
        try {
            const response = await fetch(`components/${component}.html`);
            const data = await response.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            
            document.getElementById(component).innerHTML = tempDiv.innerHTML;
            
            // Execute inline scripts (for data and initializers)
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    document.head.appendChild(newScript).remove();
                } else {
                    // Use Function constructor for safer execution
                    try {
                        new Function(script.textContent)();
                    } catch (e) {
                        console.error('Error executing script:', e);
                    }
                }
            });
            
            // Component-specific initialization
            if (component === 'hero') {
                setTimeout(initializeTypewriter, 100);
            }

            if (component === 'projects') {
                // 1. DYNAMICALLY RENDER THE CARDS (Limit 3 for homepage, assetPrefix='')
                initializeProjectSection(3, '');
                
                // 2. Initialize filtering after cards are rendered
                setTimeout(() => {
                    if (window.initializeProjectFiltering) {
                        window.initializeProjectFiltering();
                    }
                }, 100);
            }

        } catch (error) {
            console.error(`Error loading ${component}:`, error);
        }
    }
    
    // Initialize Feather icons after all content is loaded
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ------------------------------------------------------------------
// Modal and Utility Functions (Keep as provided by user)
// ------------------------------------------------------------------
function openExperienceModal(experienceId) {
    // ... (rest of function)
    const data = window.experienceData ? window.experienceData[experienceId] : null;

    if (!data) {
        console.error("Experience data not found for ID:", experienceId);
        return;
    }

    const modal = document.getElementById('experienceModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = data.content;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Re-initialize Feather icons in modal
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function closeExperienceModal() {
    const modal = document.getElementById('experienceModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Make functions globally accessible (for the HTML onclick attributes)
window.openExperienceModal = openExperienceModal;
window.closeExperienceModal = closeExperienceModal;

// Close modal when clicking outside content (listener needs to be added once)
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('experienceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeExperienceModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('experienceModal');
            if (modal && !modal.classList.contains('hidden')) {
                closeExperienceModal();
            }
        }
    });

    // Initialize smooth scrolling
    initializeSmoothScrolling();
});
// ------------------------------------------------------------------


// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadComponents(); 
});