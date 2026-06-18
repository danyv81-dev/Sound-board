// App.js - Sound Board Application Logic

let currentlyPlaying = null;
let masterVolume = 100;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initAudioGenerator();
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
    
    // Update UI immediately
    btn.classList.add('playing');
    currentlyPlaying = { sound, id: btn.id };
    document.getElementById('playingName').textContent = `Now Playing: ${sound.name}`;
    nowPlaying.classList.remove('hidden');
    
    // Try to play external audio first
    if (sound.url && sound.url.includes('http')) {
        audio.src = sound.url;
        audio.volume = masterVolume / 100;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Playing: ' + sound.name);
                })
                .catch(err => {
                    console.log('External audio failed, generating sound effect');
                    playGeneratedSound(sound.name, btn);
                });
        }
        
        // Remove playing class when audio ends
        audio.onended = () => {
            btn.classList.remove('playing');
            currentlyPlaying = null;
            nowPlaying.classList.add('hidden');
        };
    } else {
        // Use generated sound
        playGeneratedSound(sound.name, btn);
    }
}

// Play generated sound effect
function playGeneratedSound(soundName, btn) {
    if (!audioGen) {
        initAudioGenerator();
    }
    
    const name = soundName.toLowerCase();
    
    // Map sound names to effects
    if (name.includes('engine') || name.includes('car') || name.includes('motorcycle') || name.includes('rev')) {
        audioGen.generateEngineSound();
    } else if (name.includes('explosion') || name.includes('crash') || name.includes('boom')) {
        audioGen.generateExplosion();
    } else if (name.includes('whoosh') || name.includes('woosh') || name.includes('passing')) {
        audioGen.generateWhoosh();
    } else if (name.includes('laugh') || name.includes('haha') || name.includes('lol')) {
        audioGen.generateLaugh();
    } else {
        // Random effect for anything else
        audioGen.generateRandomEffect();
    }
    
    // Simulate sound end after a delay
    setTimeout(() => {
        btn.classList.remove('playing');
        currentlyPlaying = null;
        document.getElementById('nowPlaying').classList.add('hidden');
    }, 1200);
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
