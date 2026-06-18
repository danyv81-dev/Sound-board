// App.js - Sound Board Application Logic

let currentlyPlaying = null;
let masterVolume = 100;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    renderAllSounds();
    updateSoundCount();
});

// Initialize application
function initializeApp() {
    const audio = document.getElementById('audioElement');
    audio.volume = 1;
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchSection(e.target.dataset.section);
        });
    });

    // Master volume control
    document.getElementById('masterVolume').addEventListener('input', (e) => {
        masterVolume = e.target.value;
        if (currentlyPlaying) {
            document.getElementById('audioElement').volume = masterVolume / 100;
        }
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchSounds(e.target.value);
    });
}

// Render all sounds on page
function renderAllSounds() {
    for (let section in soundsDatabase) {
        for (let category in soundsDatabase[section]) {
            const sounds = soundsDatabase[section][category];
            const elementId = `${section}-${category}`;
            const container = document.getElementById(elementId);
            
            if (container) {
                container.innerHTML = '';
                sounds.forEach((sound, index) => {
                    const btn = createSoundButton(sound, `${section}-${category}-${index}`);
                    container.appendChild(btn);
                });
            }
        }
    }
}

// Create individual sound button
function createSoundButton(sound, id) {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.id = id;
    btn.innerHTML = `
        <span class="play-icon">▶</span>
        <span>${sound.name}</span>
    `;
    btn.addEventListener('click', () => playSound(sound, btn));
    return btn;
}

// Play sound
function playSound(sound, btn) {
    const audio = document.getElementById('audioElement');
    const nowPlaying = document.getElementById('nowPlaying');
    
    // Stop any currently playing sound
    if (currentlyPlaying) {
        document.getElementById(currentlyPlaying.id).classList.remove('playing');
        audio.pause();
    }
    
    // Set up and play new sound
    audio.src = sound.url;
    audio.volume = masterVolume / 100;
    
    try {
        audio.play().catch(err => {
            console.log('Audio playback error:', err);
            showNotification('Unable to play sound. The audio file may not be available.');
        });
        
        // Update UI
        btn.classList.add('playing');
        currentlyPlaying = { sound, id: btn.id };
        
        // Update now playing display
        document.getElementById('playingName').textContent = `Now Playing: ${sound.name}`;
        nowPlaying.classList.remove('hidden');
        
        // Remove playing class when audio ends
        audio.onended = () => {
            btn.classList.remove('playing');
            currentlyPlaying = null;
            nowPlaying.classList.add('hidden');
        };
    } catch (err) {
        console.error('Error playing sound:', err);
    }
}

// Stop sound
function stopSound() {
    const audio = document.getElementById('audioElement');
    const nowPlaying = document.getElementById('nowPlaying');
    
    audio.pause();
    audio.currentTime = 0;
    
    if (currentlyPlaying) {
        document.getElementById(currentlyPlaying.id).classList.remove('playing');
        currentlyPlaying = null;
    }
    
    nowPlaying.classList.add('hidden');
}

// Switch sections
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).parentElement.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Better way to switch sections
    document.querySelectorAll('.section').forEach(sec => {
        if (sec.getAttribute('data-section') === section) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });
}

// Search sounds
function searchSounds(query) {
    const lowerQuery = query.toLowerCase();
    let matchCount = 0;
    
    document.querySelectorAll('.sound-btn').forEach(btn => {
        const soundName = btn.textContent.toLowerCase();
        if (soundName.includes(lowerQuery)) {
            btn.style.display = 'flex';
            matchCount++;
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Hide empty categories
    document.querySelectorAll('.sounds-grid').forEach(grid => {
        const visibleButtons = grid.querySelectorAll('.sound-btn:not([style*="display: none"])');
        grid.parentElement.style.display = visibleButtons.length > 0 ? 'block' : 'none';
    });
    
    // Show no results message if needed
    if (matchCount === 0 && query.length > 0) {
        showNotification(`No sounds found matching "${query}"`);
    }
}

// Update sound count
function updateSoundCount() {
    const count = getTotalSoundCount();
    document.getElementById('soundCount').textContent = count;
}

// Show notification
function showNotification(message) {
    // Simple notification (could be enhanced with a toast library)
    console.log(message);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space to play/pause
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        const audio = document.getElementById('audioElement');
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
    
    // Escape to stop
    if (e.code === 'Escape') {
        stopSound();
    }
});

// Responsive adjustments
window.addEventListener('resize', () => {
    // Any responsive adjustments needed
});
