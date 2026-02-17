// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Student Note Generator initialized');
    
    // DOM Elements
    const noteForm = document.getElementById('noteForm');
    const topicInput = document.getElementById('topic');
    const subjectSelect = document.getElementById('subject');
    const noteTypeSelect = document.getElementById('noteType');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    const notesTitle = document.getElementById('notesTitle');
    const notesMetadata = document.getElementById('notesMetadata');
    const notesContent = document.getElementById('notesContent');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    const copyBtn = document.getElementById('copyNotesBtn');
    const downloadBtn = document.getElementById('downloadNotesBtn');
    const printBtn = document.getElementById('printNotesBtn');
    const topicChips = document.querySelectorAll('.topic-chip');

    // Check if all critical elements exist
    if (!noteForm || !topicInput || !subjectSelect || !noteTypeSelect || !generateBtn) {
        console.error('❌ Critical elements missing from DOM');
        return;
    }

    // Sample topics for placeholder rotation
    const sampleTopics = [
        'Photosynthesis',
        'World War II',
        'Python Programming',
        'Calculus',
        'Shakespeare\'s Hamlet',
        'Cell Biology',
        'Machine Learning',
        'Ancient Egypt',
        'Climate Change',
        'Artificial Intelligence'
    ];

    // Rotate placeholder text
    let currentSampleIndex = 0;
    setInterval(() => {
        currentSampleIndex = (currentSampleIndex + 1) % sampleTopics.length;
        topicInput.placeholder = `e.g., ${sampleTopics[currentSampleIndex]}`;
    }, 3000);

    // Topic chip click handlers
    topicChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            topicInput.value = topic;
            topicInput.focus();
            
            // Add a little animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Form submission handler
    noteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Form submitted');
        
        const topic = topicInput.value.trim();
        
        if (!topic) {
            showError('Please enter a topic to generate notes');
            topicInput.focus();
            return;
        }
        
        if (topic.length < 3) {
            showError('Topic must be at least 3 characters long');
            topicInput.focus();
            return;
        }
        
        // Clear previous results and errors
        hideError();
        hideSuccess();
        resultsSection.style.display = 'none';
        
        // Show loading state
        setLoading(true);
        
        try {
            const formData = {
                topic: topic,
                subject: subjectSelect.value,
                note_type: noteTypeSelect.value
            };
            
            console.log('📤 Sending request:', formData);
            
            const response = await fetch('/api/generate-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            console.log('📥 Response received:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate notes');
            }
            
            // Display the generated notes
            displayNotes(data);
            showSuccess('✨ Notes generated successfully!');
            
            // Save to history (optional)
            saveToHistory(topic, subjectSelect.value);
            
        } catch (error) {
            console.error('❌ Error:', error);
            showError(error.message || 'An error occurred while generating notes. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    // Display notes in the UI
    function displayNotes(data) {
        if (!data.notes) {
            console.error('❌ No notes data received');
            return;
        }
        
        // Set title
        notesTitle.textContent = data.notes.title || 'Study Notes';
        
        // Set metadata
        if (data.notes.metadata) {
            notesMetadata.innerHTML = `
                <span><i class="fas fa-book"></i> ${data.notes.subject || 'General'}</span>
                <span><i class="fas fa-clock"></i> ${data.notes.metadata.reading_time || '5 minutes'}</span>
                <span><i class="fas fa-signal"></i> ${data.notes.metadata.difficulty || 'Intermediate'}</span>
                <span><i class="fas fa-layer-group"></i> ${data.notes.metadata.sections || 5} sections</span>
            `;
        } else {
            notesMetadata.innerHTML = `
                <span><i class="fas fa-book"></i> ${data.notes.subject || 'General'}</span>
                <span><i class="fas fa-clock"></i> 5 minutes read</span>
            `;
        }
        
        // Build notes HTML
        let html = '';
        
        if (data.notes.sections && Array.isArray(data.notes.sections)) {
            data.notes.sections.forEach(section => {
                if (!section || !section.title) return;
                
                let content_html = '';
                
                if (section.content && Array.isArray(section.content)) {
                    // Check if content contains markdown-style formatting
                    const hasMarkdown = section.content.some(item => 
                        item.includes('**') || item.includes('*') || item.includes('#')
                    );
                    
                    if (hasMarkdown) {
                        // Handle markdown-style content
                        content_html = '<div class="section-content">';
                        section.content.forEach(item => {
                            // Convert markdown to HTML
                            let formattedItem = item
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/^# (.*$)/g, '<h4>$1</h4>')
                                .replace(/^## (.*$)/g, '<h5>$1</h5>')
                                .replace(/•/g, '&bull;')
                                .replace(/  /g, '&nbsp;&nbsp;');
                            
                            // Handle line breaks
                            if (formattedItem.includes('\n')) {
                                const lines = formattedItem.split('\n');
                                lines.forEach(line => {
                                    if (line.trim()) {
                                        content_html += `<p>${line}</p>`;
                                    }
                                });
                            } else {
                                content_html += `<p>${formattedItem}</p>`;
                            }
                        });
                        content_html += '</div>';
                    } else {
                        // Regular bullet points
                        content_html = '<ul>';
                        section.content.forEach(item => {
                            content_html += `<li>${item}</li>`;
                        });
                        content_html += '</ul>';
                    }
                } else if (typeof section.content === 'string') {
                    content_html = `<p>${section.content}</p>`;
                }
                
                html += `
                    <div class="note-section" data-section-type="${section.type || 'general'}">
                        <h3>
                            ${getSectionIcon(section.type || 'general')}
                            ${section.title}
                        </h3>
                        ${content_html}
                    </div>
                `;
            });
        }
        
        notesContent.innerHTML = html;
        resultsSection.style.display = 'block';
        
        // Scroll to results smoothly
        setTimeout(() => {
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    // Helper function to get section icon
    function getSectionIcon(type) {
        const icons = {
            'concepts': '<i class="fas fa-lightbulb" style="color: #fbbf24;"></i>',
            'points': '<i class="fas fa-list" style="color: #4f46e5;"></i>',
            'tips': '<i class="fas fa-tips" style="color: #10b981;"></i>',
            'intro': '<i class="fas fa-book-open" style="color: #4f46e5;"></i>',
            'analysis': '<i class="fas fa-chart-line" style="color: #ef4444;"></i>',
            'examples': '<i class="fas fa-code" style="color: #8b5cf6;"></i>',
            'practice': '<i class="fas fa-pencil-alt" style="color: #ec4899;"></i>',
            'quick': '<i class="fas fa-bolt" style="color: #f59e0b;"></i>',
            'memory': '<i class="fas fa-brain" style="color: #6366f1;"></i>',
            'overview': '<i class="fas fa-eye" style="color: #14b8a6;"></i>',
            'objectives': '<i class="fas fa-bullseye" style="color: #f43f5e;"></i>',
            'takeaways': '<i class="fas fa-star" style="color: #fbbf24;"></i>',
            'general': '<i class="fas fa-file-alt" style="color: #4f46e5;"></i>'
        };
        
        return icons[type] || icons.general;
    }

    // Copy notes to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const notesText = extractNotesText();
            
            navigator.clipboard.writeText(notesText).then(() => {
                showTemporaryMessage('📋 Notes copied to clipboard!', 'success');
                
                // Visual feedback on button
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
                
            }).catch((err) => {
                console.error('Failed to copy:', err);
                showError('Failed to copy notes. Please try again.');
            });
        });
    }

    // Download notes as text file
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const notesText = extractNotesText();
            const topic = topicInput.value.trim() || 'notes';
            const filename = `${topic.replace(/\s+/g, '_').toLowerCase()}_notes.txt`;
            
            try {
                const blob = new Blob([notesText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showTemporaryMessage('📥 Notes downloaded successfully!', 'success');
                
                // Visual feedback on button
                const originalHTML = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                setTimeout(() => {
                    downloadBtn.innerHTML = originalHTML;
                }, 2000);
                
            } catch (error) {
                console.error('Download failed:', error);
                showError('Failed to download notes. Please try again.');
            }
        });
    }

    // Print notes
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }

    // Extract text from notes for copying/downloading
    function extractNotesText() {
        const title = notesTitle.textContent;
        const metadata = Array.from(document.querySelectorAll('.notes-metadata span'))
            .map(span => span.textContent.trim())
            .join(' | ');
        
        let text = `${title}\n${'='.repeat(title.length)}\n\n`;
        text += `${metadata}\n\n`;
        text += `${'-'.repeat(50)}\n\n`;
        
        const sections = document.querySelectorAll('.note-section');
        
        sections.forEach(section => {
            const sectionTitle = section.querySelector('h3').textContent.replace(/[🔍📚⚡🧠💡📝📖🎯✅]/g, '').trim();
            text += `${sectionTitle}\n${'-'.repeat(sectionTitle.length)}\n`;
            
            const items = section.querySelectorAll('li');
            if (items.length > 0) {
                items.forEach(item => {
                    text += `• ${item.textContent}\n`;
                });
            } else {
                const paragraphs = section.querySelectorAll('p');
                paragraphs.forEach(p => {
                    text += `${p.textContent}\n`;
                });
            }
            text += '\n';
        });
        
        text += '\nGenerated by Student Note Generator';
        text += `\nDate: ${new Date().toLocaleDateString()}`;
        
        return text;
    }

    // Save to localStorage history
    function saveToHistory(topic, subject) {
        try {
            const history = JSON.parse(localStorage.getItem('noteHistory') || '[]');
            history.unshift({
                topic: topic,
                subject: subject,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 10 items
            if (history.length > 10) {
                history.pop();
            }
            
            localStorage.setItem('noteHistory', JSON.stringify(history));
        } catch (e) {
            console.log('Failed to save to history');
        }
    }

    // Utility Functions
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            const btnText = generateBtn.querySelector('.btn-text');
            const spinner = generateBtn.querySelector('.spinner');
            if (btnText) btnText.style.opacity = '0.7';
            if (spinner) spinner.style.display = 'inline-block';
            if (loadingIndicator) loadingIndicator.style.display = 'block';
        } else {
            generateBtn.disabled = false;
            const btnText = generateBtn.querySelector('.btn-text');
            const spinner = generateBtn.querySelector('.spinner');
            if (btnText) btnText.style.opacity = '1';
            if (spinner) spinner.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    function showError(message) {
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.style.display = 'flex';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideError();
            }, 5000);
        }
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    function showSuccess(message) {
        if (successMessage && successText) {
            successText.textContent = message;
            successMessage.style.display = 'flex';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                hideSuccess();
            }, 3000);
        }
    }

    function hideSuccess() {
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }

    function showTemporaryMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        // Add animation styles if not exists
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Keyboard shortcut (Ctrl/Cmd + Enter)
    topicInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            noteForm.dispatchEvent(new Event('submit'));
        }
    });

    // Input validation
    topicInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length > 0 && value.length < 3) {
            this.style.borderColor = '#f59e0b';
            this.setCustomValidity('Topic should be at least 3 characters');
        } else if (value.length >= 3) {
            this.style.borderColor = '#10b981';
            this.setCustomValidity('');
        } else {
            this.style.borderColor = '';
            this.setCustomValidity('');
        }
    });

    // Load saved preferences
    function loadPreferences() {
        try {
            const saved = localStorage.getItem('notePreferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                subjectSelect.value = prefs.subject || 'mathematics';
                noteTypeSelect.value = prefs.noteType || 'summary';
            }
        } catch (e) {
            console.log('Failed to load preferences');
        }
    }

    // Save preferences
    function savePreferences() {
        const prefs = {
            subject: subjectSelect.value,
            noteType: noteTypeSelect.value
        };
        localStorage.setItem('notePreferences', JSON.stringify(prefs));
    }

    // Add change listeners for preferences
    subjectSelect.addEventListener('change', savePreferences);
    noteTypeSelect.addEventListener('change', savePreferences);

    // Load saved preferences on start
    loadPreferences();

    // Add clear button for input
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'clear-btn';
    clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearBtn.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        display: none;
        padding: 5px;
        z-index: 10;
    `;
    
    const inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';
    topicInput.parentNode.insertBefore(inputWrapper, topicInput);
    inputWrapper.appendChild(topicInput);
    inputWrapper.appendChild(clearBtn);
    
    topicInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'block' : 'none';
    });
    
    clearBtn.addEventListener('click', function() {
        topicInput.value = '';
        topicInput.focus();
        clearBtn.style.display = 'none';
    });

    console.log('✅ App initialization complete');
});
