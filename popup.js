// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const saveConfigBtn = document.getElementById('saveConfig');
    const moveUngroupedBtn = document.getElementById('moveUngrouped');
    const aiGroupingBtn = document.getElementById('aiGrouping');
    const debugSavedBtn = document.getElementById('debugSaved');
    const exportStatesBtn = document.getElementById('exportStates');
    const importStatesBtn = document.getElementById('importStates');
    const saveStateNameInput = document.getElementById('saveStateName');
    const savedStatesDiv = document.getElementById('savedStates');
    const statusDiv = document.getElementById('status');
    const importExportDataTextarea = document.getElementById('importExportData');

    // Better way to define sorting rules - no repetitive typing!
    const sortingRules = {
        // Communication & Social
        "Communication": ["gmail", "outlook", "slack", "discord", "teams", "zoom", "telegram", "whatsapp", "skype", "messenger", "google meet", "webex", "signal"],
        "Social": ["facebook", "twitter", "instagram", "linkedin", "reddit", "tiktok", "pinterest", "tumblr", "snapchat", "threads", "mastodon", "bereal"],

        // Work & Productivity
        "Development": ["github", "stackoverflow", "codepen", "replit", "codesandbox", "jsfiddle", "gitlab", "bitbucket", "vercel", "netlify", "docker hub", "postman", "firebase", "heroku", "atlassian", "jira"],
        "Productivity": ["notion", "trello", "asana", "monday", "clickup", "todoist", "google keep", "evernote", "miro", "airtable", "google docs", "microsoft office", "obsidian"],
        "Design & Creative": ["figma", "dribbble", "behance", "adobe", "canva", "unsplash", "pexels", "artstation", "invision", "sketch", "framer"],
        "Finance": ["paypal", "stripe", "coinbase", "binance", "robinhood", "fidelity", "chase", "wise", "venmo", "revolut", "mint", "ynab"],

        // Media & Entertainment
        "Media": ["youtube", "netflix", "twitch", "spotify", "vimeo", "hulu", "disney+", "hbo max", "apple tv", "soundcloud", "bandcamp", "peacock", "crunchyroll", "pandora", "audible"],
        "Gaming": ["steam", "epic games", "gog", "itch.io", "ign", "gamespot", "roblox", "minecraft", "ea", "ubisoft", "blizzard", "nintendo"],
        "News": ["cnn", "bbc", "reuters", "nytimes", "reddit", "hackernews", "the guardian", "associated press", "washington post", "al jazeera", "forbes", "bloomberg", "npr", "techcrunch", "the verge"],

        // Lifestyle & Knowledge
        "Shopping": ["amazon", "ebay", "etsy", "shopify", "alibaba", "walmart", "target", "best buy", "aliexpress", "temu", "ikea", "newegg", "shein"],
        "Education": ["coursera", "udemy", "edx", "khan academy", "skillshare", "linkedin learning", "duolingo", "quizlet", "chegg", "brilliant", "masterclass"],
        "Health & Fitness": ["myfitnesspal", "strava", "webmd", "mayo clinic", "nike", "peloton", "fitbit", "calm", "headspace", "whoop"],
        "Travel": ["airbnb", "booking.com", "expedia", "google flights", "kayak", "tripadvisor", "skyscanner", "uber", "lyft", "marriott", "delta"],
        "Food & Recipes": ["allrecipes", "food network", "yummly", "seriouseats", "doordash", "uber eats", "grubhub", "instacart", "hellofresh", "bon appetit"],

        // Utilities & Reference
        "Cloud Storage": ["google drive", "dropbox", "onedrive", "icloud", "mega", "box", "pcloud", "idrive"],
        "Reference & Search": ["google", "duckduckgo", "wikipedia", "wolframalpha", "imdb", "goodreads", "quora", "stack exchange", "archive.org", "mdn web docs"]
    };

    // Create reverse lookup for easy domain-to-category mapping
    const domainToCategory = {};
    Object.entries(sortingRules).forEach(([category, domains]) => {
        domains.forEach(domain => {
            domainToCategory[domain] = category;
        });
    });

    // Load saved states on popup open
    loadSavedStates();

    // Save current configuration
    saveConfigBtn.addEventListener('click', async function() {
        const stateName = saveStateNameInput.value.trim();
        if (!stateName) {
            showStatus('Please enter a name for the configuration', 'error');
            return;
        }

        try {
            showStatus('Saving configuration...', 'success');
            const currentState = await getCurrentTabConfiguration();
            console.log('About to save:', currentState);
            
            await saveConfiguration(stateName, currentState);
            saveStateNameInput.value = '';
            loadSavedStates();
            showStatus(`Configuration "${stateName}" saved successfully!`, 'success');
        } catch (error) {
            console.error('Save error:', error);
            showStatus('Error saving configuration: ' + error.message, 'error');
        }
    });

    // Move ungrouped tabs
    moveUngroupedBtn.addEventListener('click', async function() {
        try {
            await moveUngroupedTabs();
            showStatus('Ungrouped tabs moved successfully!', 'success');
        } catch (error) {
            showStatus('Error moving tabs: ' + error.message, 'error');
        }
    });

    // AI Grouping (placeholder)
    aiGroupingBtn.addEventListener('click', function() {
        showStatus('AI Grouping feature coming soon!', 'error');
    });

    // Export save states
    exportStatesBtn.addEventListener('click', async function() {
        try {
            const exported = await exportSaveStates();
            importExportDataTextarea.value = exported;
            importExportDataTextarea.select();
            showStatus('Save states exported! Data copied to textarea.', 'success');
        } catch (error) {
            showStatus('Error exporting save states: ' + error.message, 'error');
        }
    });

    // Import save states
    importStatesBtn.addEventListener('click', async function() {
        const importData = importExportDataTextarea.value.trim();
        if (!importData) {
            showStatus('Please paste the exported data first', 'error');
            return;
        }

        if (confirm('This will merge with your existing save states. Continue?')) {
            try {
                await importSaveStates(importData);
                loadSavedStates();
                importExportDataTextarea.value = '';
                showStatus('Save states imported successfully!', 'success');
            } catch (error) {
                showStatus('Error importing save states: ' + error.message, 'error');
            }
        }
    });

    // Debug saved configurations
    debugSavedBtn.addEventListener('click', async function() {
        chrome.storage.local.get(['savedConfigurations'], (result) => {
            const saved = result.savedConfigurations || {};
            console.log('All saved configurations:', JSON.stringify(saved, null, 2));
            
            // Also show in the UI
            let debugInfo = 'Saved Configurations:\n';
            if (Object.keys(saved).length === 0) {
                debugInfo += 'No saved configurations found.';
            } else {
                for (const [name, config] of Object.entries(saved)) {
                    debugInfo += `\n${name}:\n`;
                    debugInfo += `  - Tabs: ${config.tabs ? config.tabs.length : 0}\n`;
                    debugInfo += `  - Groups: ${config.groups ? config.groups.length : 0}\n`;
                    if (config.groups) {
                        config.groups.forEach(group => {
                            debugInfo += `    * ${group.title} (${group.color})\n`;
                        });
                    }
                }
            }
            
            alert(debugInfo);
            showStatus('Debug info shown in alert and console', 'success');
        });
    });

    async function getCurrentTabConfiguration() {
        try {
            console.log('Getting current tabs...');
            const tabs = await new Promise((resolve) => {
                chrome.tabs.query({}, (tabs) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error querying tabs:', chrome.runtime.lastError);
                    }
                    console.log('Found tabs:', tabs.length);
                    resolve(tabs || []);
                });
            });

            console.log('Getting tab groups...');
            const tabGroups = await new Promise((resolve) => {
                chrome.tabGroups.query({}, (groups) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error querying groups:', chrome.runtime.lastError);
                    }
                    console.log('Found groups:', groups.length);
                    resolve(groups || []);
                });
            });
            
            const configuration = {
                timestamp: new Date().toISOString(),
                tabs: tabs.map(tab => ({
                    id: tab.id,
                    url: tab.url,
                    title: tab.title,
                    groupId: tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE ? -1 : tab.groupId,
                    index: tab.index,
                    pinned: tab.pinned
                })),
                groups: tabGroups.map(group => ({
                    id: group.id,
                    title: group.title,
                    color: group.color,
                    collapsed: group.collapsed
                }))
            };
            
            console.log('Created configuration:', configuration);
            return configuration;
        } catch (error) {
            console.error('Error in getCurrentTabConfiguration:', error);
            throw error;
        }
    }

    async function saveConfiguration(name, configuration) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['savedConfigurations'], (result) => {
                const saved = result.savedConfigurations || {};
                saved[name] = configuration;
                
                chrome.storage.local.set({ savedConfigurations: saved }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async function loadSavedStates() {
        chrome.storage.local.get(['savedConfigurations'], (result) => {
            const saved = result.savedConfigurations || {};
            displaySavedStates(saved);
        });
    }

    function displaySavedStates(savedStates) {
        savedStatesDiv.innerHTML = '';
        
        if (Object.keys(savedStates).length === 0) {
            savedStatesDiv.innerHTML = '<div style="color: #999; font-size: 11px;">No saved configurations</div>';
            return;
        }

        Object.keys(savedStates).forEach(stateName => {
            const stateDiv = document.createElement('div');
            stateDiv.className = 'saved-state';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'state-name';
            nameSpan.textContent = stateName;
            
            // ADD button - adds configuration without closing existing tabs/groups
            const addBtn = document.createElement('button');
            addBtn.className = 'small-button';
            addBtn.style.background = '#28a745';
            addBtn.textContent = 'Add';
            addBtn.addEventListener('click', () => addConfiguration(stateName));
            
            // LOAD button - loads configuration like before (replaces everything)
            const loadBtn = document.createElement('button');
            loadBtn.className = 'small-button';
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', () => loadConfiguration(stateName));
            
            // DELETE button - same as before
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'small-button';
            deleteBtn.style.background = '#d13438';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteConfiguration(stateName));
            
            stateDiv.appendChild(nameSpan);
            stateDiv.appendChild(addBtn);
            stateDiv.appendChild(loadBtn);
            stateDiv.appendChild(deleteBtn);
            
            savedStatesDiv.appendChild(stateDiv);
        });
    }

    // NEW: Add configuration without closing existing tabs/groups
    async function addConfiguration(stateName) {
        try {
            showStatus('Adding configuration...', 'success');
            await addConfigurationByName(stateName);
            showStatus(`Configuration "${stateName}" added successfully!`, 'success');
        } catch (error) {
            console.error('Add error details:', error);
            showStatus('Error adding configuration: ' + error.message, 'error');
        }
    }

    // MODIFIED: Renamed from restoreConfiguration for clarity
    async function loadConfiguration(stateName) {
        try {
            showStatus('Loading configuration...', 'success');
            await loadConfigurationByName(stateName);
            showStatus(`Configuration "${stateName}" loaded successfully!`, 'success');
        } catch (error) {
            console.error('Load error details:', error);
            showStatus('Error loading configuration: ' + error.message, 'error');
        }
    }

    async function deleteConfiguration(stateName) {
        if (confirm(`Are you sure you want to delete "${stateName}"?`)) {
            try {
                await deleteConfigurationByName(stateName);
                loadSavedStates();
                showStatus(`Configuration "${stateName}" deleted successfully!`, 'success');
            } catch (error) {
                showStatus('Error deleting configuration: ' + error.message, 'error');
            }
        }
    }

    // NEW: Add configuration function that preserves existing tabs/groups
    async function addConfigurationByName(stateName) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['savedConfigurations'], async (result) => {
                const saved = result.savedConfigurations || {};
                const configuration = saved[stateName];
                
                console.log('Starting add for:', stateName);
                console.log('Configuration to add:', configuration);
                
                if (!configuration) {
                    reject(new Error('Configuration not found'));
                    return;
                }

                if (!configuration.tabs || configuration.tabs.length === 0) {
                    reject(new Error('No tabs found in configuration'));
                    return;
                }

                try {
                    // Step 1: Get current groups to check for existing ones
                    console.log('Step 1: Getting current groups...');
                    const currentGroups = await new Promise((resolve) => {
                        chrome.tabGroups.query({}, (groups) => {
                            console.log('Current groups:', groups.length);
                            resolve(groups || []);
                        });
                    });

                    // Create a map of existing group titles to their IDs
                    const existingGroupMap = {};
                    currentGroups.forEach(group => {
                        existingGroupMap[group.title] = group.id;
                    });

                    // Step 2: Create tabs from saved configuration
                    console.log('Step 2: Creating tabs...');
                    const createdTabs = [];

                    for (const savedTab of configuration.tabs) {
                        console.log(`Creating tab: ${savedTab.url}`);
                        
                        const newTab = await new Promise((resolve) => {
                            chrome.tabs.create({
                                url: savedTab.url,
                                pinned: savedTab.pinned,
                                active: false
                            }, (tab) => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error creating tab:', chrome.runtime.lastError);
                                }
                                resolve(tab);
                            });
                        });
                        
                        createdTabs.push({
                            id: newTab.id,
                            originalGroupId: savedTab.groupId,
                            pinned: savedTab.pinned
                        });
                        
                        // Small delay between tab creation
                        //await new Promise(resolve => setTimeout(resolve, 200));
                    }

                    console.log('All tabs created:', createdTabs);

                    // Step 3: Wait for tabs to load
                    console.log('Step 3: Waiting for tabs to load...');
                    //await new Promise(resolve => setTimeout(resolve, 1000));

                    // Step 4: Create or add to groups
                    if (configuration.groups && configuration.groups.length > 0) {
                        console.log('Step 4: Processing groups...');
                        
                        for (const savedGroup of configuration.groups) {
                            console.log(`Processing group: ${savedGroup.title} (ID: ${savedGroup.id})`);
                            
                            // Find tabs that belong to this group (exclude pinned tabs)
                            const tabsForGroup = createdTabs.filter(tab => 
                                tab.originalGroupId === savedGroup.id && !tab.pinned
                            );
                            
                            console.log(`Tabs for group ${savedGroup.title}:`, tabsForGroup);
                            
                            if (tabsForGroup.length > 0) {
                                try {
                                    let targetGroupId;
                                    
                                    // Check if group with same title already exists
                                    if (existingGroupMap[savedGroup.title]) {
                                        console.log(`Group "${savedGroup.title}" already exists, adding tabs to it`);
                                        targetGroupId = existingGroupMap[savedGroup.title];
                                        
                                        // Add tabs to existing group
                                        await new Promise((resolve, reject) => {
                                            chrome.tabs.group({
                                                tabIds: tabsForGroup.map(t => t.id),
                                                groupId: targetGroupId
                                            }, (groupId) => {
                                                if (chrome.runtime.lastError) {
                                                    console.error('Error adding to existing group:', chrome.runtime.lastError);
                                                    reject(chrome.runtime.lastError);
                                                } else {
                                                    console.log('Tabs added to existing group:', groupId);
                                                    resolve(groupId);
                                                }
                                            });
                                        });
                                    } else {
                                        console.log(`Creating new group: ${savedGroup.title}`);
                                        
                                        // Create new group
                                        targetGroupId = await new Promise((resolve, reject) => {
                                            chrome.tabs.group({
                                                tabIds: tabsForGroup.map(t => t.id)
                                            }, (groupId) => {
                                                if (chrome.runtime.lastError) {
                                                    console.error('Error creating group:', chrome.runtime.lastError);
                                                    reject(chrome.runtime.lastError);
                                                } else {
                                                    console.log('Group created with ID:', groupId);
                                                    resolve(groupId);
                                                }
                                            });
                                        });
                                        
                                        // Update group properties
                                        await new Promise((resolve) => {
                                            chrome.tabGroups.update(targetGroupId, {
                                                title: savedGroup.title || 'Added Group',
                                                color: savedGroup.color || 'grey'
                                            }, () => {
                                                if (chrome.runtime.lastError) {
                                                    console.error('Error updating group:', chrome.runtime.lastError);
                                                }
                                                console.log(`Group updated: ${savedGroup.title}`);
                                                resolve();
                                            });
                                        });
                                    }
                                    
                                } catch (groupError) {
                                    console.error('Error with group processing:', groupError);
                                }
                            } else {
                                console.log(`No tabs found for group ${savedGroup.title}`);
                            }
                        }
                    }

                    console.log('Add operation completed successfully');
                    resolve();
                    
                } catch (error) {
                    console.error('Add operation error:', error);
                    reject(error);
                }
            });
        });
    }

    // RENAMED: Original restore function for clarity
    async function loadConfigurationByName(stateName) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['savedConfigurations'], async (result) => {
                const saved = result.savedConfigurations || {};
                const configuration = saved[stateName];
                
                console.log('Starting load for:', stateName);
                console.log('Configuration to load:', configuration);
                
                if (!configuration) {
                    reject(new Error('Configuration not found'));
                    return;
                }

                if (!configuration.tabs || configuration.tabs.length === 0) {
                    reject(new Error('No tabs found in configuration'));
                    return;
                }

                try {
                    // Step 1: Get current tabs and close them (except one)
                    console.log('Step 1: Getting current tabs...');
                    const currentTabs = await new Promise((resolve) => {
                        chrome.tabs.query({ currentWindow: true }, (tabs) => {
                            console.log('Current tabs:', tabs.length);
                            resolve(tabs);
                        });
                    });
                    
                    // Close all tabs except the first one
                    if (currentTabs.length > 1) {
                        const tabsToClose = currentTabs.slice(1).map(tab => tab.id);
                        console.log('Closing tabs:', tabsToClose);
                        await new Promise((resolve) => {
                            chrome.tabs.remove(tabsToClose, () => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error closing tabs:', chrome.runtime.lastError);
                                }
                                resolve();
                            });
                        });
                    }

                    // Step 2: Update the first tab
                    console.log('Step 2: Updating first tab...');
                    const firstSavedTab = configuration.tabs[0];
                    const firstCurrentTab = currentTabs[0];
                    
                    await new Promise((resolve) => {
                        chrome.tabs.update(firstCurrentTab.id, { 
                            url: firstSavedTab.url,
                            pinned: firstSavedTab.pinned 
                        }, (tab) => {
                            if (chrome.runtime.lastError) {
                                console.error('Error updating first tab:', chrome.runtime.lastError);
                            }
                            console.log('Updated first tab to:', tab.url);
                            resolve();
                        });
                    });

                    // Step 3: Create remaining tabs
                    console.log('Step 3: Creating remaining tabs...');
                    const createdTabs = [{ 
                        id: firstCurrentTab.id, 
                        originalGroupId: firstSavedTab.groupId,
                        pinned: firstSavedTab.pinned 
                    }];

                    for (let i = 1; i < configuration.tabs.length; i++) {
                        const savedTab = configuration.tabs[i];
                        console.log(`Creating tab ${i}: ${savedTab.url}`);
                        
                        const newTab = await new Promise((resolve) => {
                            chrome.tabs.create({
                                url: savedTab.url,
                                pinned: savedTab.pinned,
                                active: false
                            }, (tab) => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error creating tab:', chrome.runtime.lastError);
                                }
                                resolve(tab);
                            });
                        });
                        
                        createdTabs.push({
                            id: newTab.id,
                            originalGroupId: savedTab.groupId,
                            pinned: savedTab.pinned
                        });
                        
                        // Small delay between tab creation
                        //await new Promise(resolve => setTimeout(resolve, 200));
                    }

                    console.log('All tabs created:', createdTabs);

                    // Step 4: Wait for tabs to load
                    console.log('Step 4: Waiting for tabs to load...');
                    //await new Promise(resolve => setTimeout(resolve, 1000));

                    // Step 5: Create groups
                    if (configuration.groups && configuration.groups.length > 0) {
                        console.log('Step 5: Creating groups...');
                        
                        for (const savedGroup of configuration.groups) {
                            console.log(`Processing group: ${savedGroup.title} (ID: ${savedGroup.id})`);
                            
                            // Find tabs that belong to this group (exclude pinned tabs)
                            const tabsForGroup = createdTabs.filter(tab => 
                                tab.originalGroupId === savedGroup.id && !tab.pinned
                            );
                            
                            console.log(`Tabs for group ${savedGroup.title}:`, tabsForGroup);
                            
                            if (tabsForGroup.length > 0) {
                                try {
                                    console.log('Creating group with tab IDs:', tabsForGroup.map(t => t.id));
                                    
                                    const groupId = await new Promise((resolve, reject) => {
                                        chrome.tabs.group({
                                            tabIds: tabsForGroup.map(t => t.id)
                                        }, (groupId) => {
                                            if (chrome.runtime.lastError) {
                                                console.error('Error creating group:', chrome.runtime.lastError);
                                                reject(chrome.runtime.lastError);
                                            } else {
                                                console.log('Group created with ID:', groupId);
                                                resolve(groupId);
                                            }
                                        });
                                    });
                                    
                                    // Update group properties
                                    await new Promise((resolve) => {
                                        chrome.tabGroups.update(groupId, {
                                            title: savedGroup.title || 'Loaded Group',
                                            color: savedGroup.color || 'grey'
                                        }, () => {
                                            if (chrome.runtime.lastError) {
                                                console.error('Error updating group:', chrome.runtime.lastError);
                                            }
                                            console.log(`Group updated: ${savedGroup.title}`);
                                            resolve();
                                        });
                                    });
                                    
                                } catch (groupError) {
                                    console.error('Error with group creation:', groupError);
                                }
                            } else {
                                console.log(`No tabs found for group ${savedGroup.title}`);
                            }
                        }
                    }

                    console.log('Load operation completed successfully');
                    resolve();
                    
                } catch (error) {
                    console.error('Load operation error:', error);
                    reject(error);
                }
            });
        });
    }

    async function deleteConfigurationByName(stateName) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['savedConfigurations'], (result) => {
                const saved = result.savedConfigurations || {};
                delete saved[stateName];
                
                chrome.storage.local.set({ savedConfigurations: saved }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async function moveUngroupedTabs() {
        const tabs = await chrome.tabs.query({});
        const ungroupedTabs = tabs.filter(tab => tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE && !tab.pinned);
        
        if (ungroupedTabs.length === 0) {
            throw new Error('No ungrouped tabs found');
        }

        const existingGroups = await chrome.tabGroups.query({});
        
        if (existingGroups.length === 0) {
            throw new Error('No existing tab groups found to move tabs into');
        }

        // Randomly distribute ungrouped tabs among existing groups
        for (const tab of ungroupedTabs) {
            const randomGroup = existingGroups[Math.floor(Math.random() * existingGroups.length)];
            await chrome.tabs.group({ tabIds: [tab.id], groupId: randomGroup.id });
        }
    }

    // Helper function to categorize tabs using the improved sorting rules
    function categorizeUrl(url) {
        const hostname = new URL(url).hostname.toLowerCase();
        
        // Check each domain in our rules
        for (const domain of Object.keys(domainToCategory)) {
            if (hostname.includes(domain)) {
                return domainToCategory[domain];
            }
        }
        
        // Default category if no match found
        return 'Miscellaneous';
    }

    // Export save states functionality
    async function exportSaveStates() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['savedConfigurations'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                const saved = result.savedConfigurations || {};
                
                if (Object.keys(saved).length === 0) {
                    reject(new Error('No save states to export'));
                    return;
                }

                // Create export object with metadata
                const exportData = {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    extensionName: 'Tab Group Manager',
                    configurations: saved
                };

                // Convert to base64 encoded JSON for safe transport
                const jsonString = JSON.stringify(exportData);
                const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
                
                // Add header for easy identification
                const exportString = `TAB_GROUP_MANAGER_EXPORT:${base64Data}`;
                
                resolve(exportString);
            });
        });
    }

    // Import save states functionality
    async function importSaveStates(importString) {
        return new Promise((resolve, reject) => {
            try {
                // Check if it has the correct header
                if (!importString.startsWith('TAB_GROUP_MANAGER_EXPORT:')) {
                    reject(new Error('Invalid export format. Please use data exported from this extension.'));
                    return;
                }

                // Extract the base64 data
                const base64Data = importString.replace('TAB_GROUP_MANAGER_EXPORT:', '');
                
                // Decode from base64
                const jsonString = decodeURIComponent(escape(atob(base64Data)));
                const importData = JSON.parse(jsonString);

                // Validate the import data
                if (!importData.configurations || typeof importData.configurations !== 'object') {
                    reject(new Error('Invalid export data structure'));
                    return;
                }

                // Validate each configuration
                for (const [name, config] of Object.entries(importData.configurations)) {
                    if (!config.tabs || !Array.isArray(config.tabs)) {
                        reject(new Error(`Invalid configuration format for "${name}"`));
                        return;
                    }
                }

                // Get existing configurations
                chrome.storage.local.get(['savedConfigurations'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    const existing = result.savedConfigurations || {};
                    
                    // Merge imported configurations with existing ones
                    // If there are name conflicts, the imported ones will overwrite
                    const merged = { ...existing, ...importData.configurations };

                    // Save the merged configurations
                    chrome.storage.local.set({ savedConfigurations: merged }, () => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            const importedCount = Object.keys(importData.configurations).length;
                            console.log(`Imported ${importedCount} configurations`);
                            resolve();
                        }
                    });
                });

            } catch (error) {
                if (error.name === 'SyntaxError') {
                    reject(new Error('Invalid export data format. Please check the data and try again.'));
                } else {
                    reject(new Error('Failed to parse import data: ' + error.message));
                }
            }
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});