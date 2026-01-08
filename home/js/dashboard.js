// Force dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Keyboard shortcut: Ctrl+Space to focus search
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        document.querySelector('.search-input').focus();
    }
});

// ========================================
// TIME & DATE
// ========================================
function updateTime() {
    const now = new Date();
    const options = { timeZone: 'America/Chicago' };

    const timeStr = now.toLocaleTimeString('en-US', {
        ...options,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('time').textContent = timeStr;

    const dateStr = now.toLocaleDateString('en-US', {
        ...options,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('date').textContent = dateStr;

    const hour = new Date().toLocaleString('en-US', { ...options, hour: 'numeric', hour12: false });
    const hourNum = parseInt(hour);
    let greeting = 'Good evening, Vinny';
    if (hourNum < 12) greeting = 'Good morning, Vinny';
    else if (hourNum < 17) greeting = 'Good afternoon, Vinny';
    document.getElementById('greeting').textContent = greeting;
}

updateTime();
setInterval(updateTime, 1000);

// ========================================
// WEATHER
// ========================================
async function fetchWeather() {
    try {
        const response = await fetch('https://wttr.in/St.Louis,Missouri?format=%t|%C&u');
        const data = await response.text();
        let [temp, condition] = data.split('|');

        // Remove + sign but keep - for negative temps
        temp = temp.trim().replace(/^\+/, '');

        let icon = 'fa-cloud-sun';
        const condLower = condition.toLowerCase();
        if (condLower.includes('sunny') || condLower.includes('clear')) icon = 'fa-sun';
        else if (condLower.includes('rain')) icon = 'fa-cloud-rain';
        else if (condLower.includes('snow')) icon = 'fa-snowflake';
        else if (condLower.includes('cloud')) icon = 'fa-cloud';
        else if (condLower.includes('thunder')) icon = 'fa-bolt';
        else if (condLower.includes('fog') || condLower.includes('mist')) icon = 'fa-smog';

        document.getElementById('weather').innerHTML = `
            <div class="weather-temp-row">
                <i class="fas ${icon}"></i>
                <span class="weather-temp-display">${temp}</span>
            </div>
            <div class="weather-condition-inline">${condition.trim()}</div>
            <div class="weather-location">St. Louis, MO</div>
        `;
    } catch (error) {
        console.error('Weather fetch failed:', error);
    }
}

fetchWeather();
setInterval(fetchWeather, 600000);

// ========================================
// TODO LIST
// ========================================
let todos = JSON.parse(localStorage.getItem('vinny-todos')) || [];

// Migrate old todos to new format with priority and notes
todos = todos.map(todo => ({
    text: todo.text || '',
    completed: todo.completed || false,
    priority: todo.priority || 'medium',
    note: todo.note || '',
    showNote: todo.showNote || false
}));

function saveTodos() {
    localStorage.setItem('vinny-todos', JSON.stringify(todos));
}

function manualSortTodos() {
    const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
    todos.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById('todoList');

    if (todos.length === 0) {
        list.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
        return;
    }

    list.innerHTML = todos.map((todo, index) => `
        <li class="todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}" style="flex-direction: column; align-items: stretch;">
            <div class="todo-content-wrapper">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
                <div class="todo-main-content">
                    <span class="todo-text" onclick="startEditTodo(${index})" id="todo-text-${index}">${escapeHtml(todo.text)}</span>
                </div>
                <div class="todo-actions">
                    <button class="priority-icon-btn" onclick="togglePriorityDropdown(event, ${index})" title="Change priority">
                        <i class="fas fa-flag"></i>
                        <div class="priority-dropdown" id="priority-dropdown-${index}">
                            <div class="priority-option none ${todo.priority === 'none' ? 'selected' : ''}" onclick="selectPriority(event, ${index}, 'none')">None</div>
                            <div class="priority-option low ${todo.priority === 'low' ? 'selected' : ''}" onclick="selectPriority(event, ${index}, 'low')">Low</div>
                            <div class="priority-option medium ${todo.priority === 'medium' ? 'selected' : ''}" onclick="selectPriority(event, ${index}, 'medium')">Medium</div>
                            <div class="priority-option high ${todo.priority === 'high' ? 'selected' : ''}" onclick="selectPriority(event, ${index}, 'high')">High</div>
                        </div>
                    </button>
                    <button class="todo-action-btn" onclick="toggleNote(${index})" title="Add/view note">
                        <i class="fas fa-sticky-note"></i>
                    </button>
                    <button class="todo-action-btn" onclick="deleteTodo(${index})" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${todo.showNote ? `
                <div class="todo-note">
                    <textarea class="todo-note-input" placeholder="Add a note..." onblur="saveNote(${index}, this.value)" onkeydown="if(event.key==='Escape') {this.blur();}">${escapeHtml(todo.note)}</textarea>
                </div>
            ` : ''}
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text) {
        todos.unshift({
            text,
            completed: false,
            priority: 'medium',
            note: '',
            showNote: false
        });
        saveTodos();
        renderTodos();
        input.value = '';
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function togglePriorityDropdown(event, index) {
    event.stopPropagation();
    const dropdown = document.getElementById(`priority-dropdown-${index}`);

    // Close all other dropdowns
    document.querySelectorAll('.priority-dropdown').forEach(dd => {
        if (dd.id !== `priority-dropdown-${index}`) {
            dd.classList.remove('show');
        }
    });

    dropdown.classList.toggle('show');
}

function selectPriority(event, index, priority) {
    event.stopPropagation();
    todos[index].priority = priority;
    saveTodos();
    renderTodos();
}

// Close priority dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.priority-icon-btn')) {
        document.querySelectorAll('.priority-dropdown').forEach(dd => {
            dd.classList.remove('show');
        });
    }
});

function startEditTodo(index) {
    const textSpan = document.getElementById(`todo-text-${index}`);
    const currentText = todos[index].text;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-text-input';
    input.value = currentText;

    textSpan.replaceWith(input);
    input.focus();
    input.select();

    const finishEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            todos[index].text = newText;
            saveTodos();
        }
        renderTodos();
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            renderTodos();
        }
    });
}

function toggleNote(index) {
    todos[index].showNote = !todos[index].showNote;
    saveTodos();
    renderTodos();

    // Focus the textarea if we just opened it
    if (todos[index].showNote) {
        setTimeout(() => {
            const textarea = document.querySelector(`#todoList .todo-item:nth-child(${index + 1}) .todo-note-input`);
            if (textarea) textarea.focus();
        }, 50);
    }
}

function saveNote(index, noteText) {
    todos[index].note = noteText;
    saveTodos();
}

document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

renderTodos();

// ========================================
// NOTES WITH FOLDERS
// ========================================
const notesArea = document.getElementById('notesArea');
const notesSidebar = document.getElementById('notesSidebar');
const folderList = document.getElementById('folderList');
const currentFolderName = document.getElementById('currentFolderName');
const noteTitleInput = document.getElementById('noteTitleInput');

let expandedFolders = new Set();

// Initialize folders from localStorage or create default
let folders = JSON.parse(localStorage.getItem('vinny-notes-folders-v3')) || [
    { id: 'general', name: 'General', multiNoteMode: false, content: '', notes: [] }
];
let currentFolder = localStorage.getItem('vinny-notes-current-folder-v3') || 'general';
let currentNoteId = null;

// Migrate from v2
const oldFoldersV2 = localStorage.getItem('vinny-notes-folders-v2');
if (oldFoldersV2 && !localStorage.getItem('vinny-notes-folders-v3')) {
    try {
        const oldData = JSON.parse(oldFoldersV2);
        folders = oldData.map(folder => ({
            ...folder,
            multiNoteMode: folder.notes && folder.notes.length > 0,
            content: '',
            notes: folder.notes || []
        }));
        saveFolders();
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

// Ensure each folder has required properties
folders = folders.map(f => ({
    ...f,
    multiNoteMode: f.multiNoteMode || false,
    content: f.content || '',
    notes: f.notes || []
}));

function saveFolders() {
    localStorage.setItem('vinny-notes-folders-v3', JSON.stringify(folders));
    localStorage.setItem('vinny-notes-current-folder-v3', currentFolder);
}

function getCurrentFolder() {
    return folders.find(f => f.id === currentFolder);
}

function getCurrentNote() {
    const folder = getCurrentFolder();
    if (!folder || !currentNoteId) return null;
    return folder.notes.find(n => n.id === currentNoteId);
}

function saveCurrentContent() {
    const folder = getCurrentFolder();
    if (!folder) return;

    if (folder.multiNoteMode) {
        const note = getCurrentNote();
        if (note) {
            note.title = noteTitleInput.value.trim() || 'Untitled';
            note.content = notesArea.value;
            note.updatedAt = Date.now();
            renderFolders();
        }
    } else {
        folder.content = notesArea.value;
    }
    saveFolders();
}

function toggleNotesMenu() {
    notesSidebar.classList.toggle('open');
}

function toggleMultiNoteMode(event, folderId) {
    event.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    folder.multiNoteMode = !folder.multiNoteMode;

    // If enabling multi-note mode and no notes exist, create first note
    if (folder.multiNoteMode && folder.notes.length === 0) {
        folder.notes.push({
            id: 'note-' + Date.now(),
            title: 'Note 1',
            content: folder.content || '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        folder.content = '';
        expandedFolders.add(folderId);
    }

    saveFolders();
    renderFolders();

    // If this is the current folder, update the view
    if (folderId === currentFolder) {
        updateEditorView();
    }
}

function toggleFolderExpand(event, folderId) {
    event.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (!folder || !folder.multiNoteMode) return;

    if (expandedFolders.has(folderId)) {
        expandedFolders.delete(folderId);
    } else {
        expandedFolders.add(folderId);
    }
    renderFolders();
}

function updateEditorView() {
    const folder = getCurrentFolder();
    if (!folder) return;

    if (folder.multiNoteMode) {
        noteTitleInput.classList.add('show');
        if (folder.notes.length > 0) {
            selectNote(folder.notes[0].id);
        } else {
            notesArea.value = '';
        }
    } else {
        noteTitleInput.classList.remove('show');
        currentNoteId = null;
        notesArea.value = folder.content || '';
    }
}

function renderFolders() {
    folderList.innerHTML = folders.map(folder => {
        const isExpanded = expandedFolders.has(folder.id);
        const hasNotes = folder.multiNoteMode && folder.notes.length > 0;

        let html = `
            <li>
                <div class="folder-item ${folder.id === currentFolder ? 'active' : ''} ${isExpanded ? 'expanded' : ''}" onclick="switchFolder('${folder.id}')">
                    ${hasNotes ? `<i class="fas fa-chevron-right folder-expand-icon" onclick="toggleFolderExpand(event, '${folder.id}')"></i>` : '<i class="fas fa-folder"></i>'}
                    <span>${folder.name}</span>
                    ${folder.multiNoteMode ? `<button class="folder-add-note-btn" onclick="addNoteToFolder(event, '${folder.id}')" title="Add note"><i class="fas fa-plus"></i></button>` : ''}
                    <button class="folder-multi-toggle ${folder.multiNoteMode ? 'active' : ''}" onclick="toggleMultiNoteMode(event, '${folder.id}')" title="Toggle multiple notes">
                        <i class="fas fa-${folder.multiNoteMode ? 'list' : 'plus'}"></i>
                    </button>
                    ${folder.id !== 'general' ? `<button class="folder-delete" onclick="deleteFolder(event, '${folder.id}')"><i class="fas fa-times"></i></button>` : ''}
                </div>`;

        if (hasNotes && isExpanded) {
            html += `<ul class="folder-notes-list show">`;
            folder.notes.forEach(note => {
                html += `
                    <li class="sidebar-note-item ${note.id === currentNoteId ? 'active' : ''}" onclick="selectNoteFromSidebar(event, '${folder.id}', '${note.id}')">
                        <i class="fas fa-file-alt"></i>
                        <span>${note.title || 'Untitled'}</span>
                        <button class="sidebar-note-delete" onclick="deleteNote(event, '${note.id}')"><i class="fas fa-times"></i></button>
                    </li>
                `;
            });
            html += `</ul>`;
        }

        html += `</li>`;
        return html;
    }).join('');
}

function selectNoteFromSidebar(event, folderId, noteId) {
    event.stopPropagation();
    if (currentFolder !== folderId) {
        switchFolder(folderId);
    }
    selectNote(noteId);
}

function addNoteToFolder(event, folderId) {
    event.stopPropagation();
    const folder = folders.find(f => f.id === folderId);
    if (!folder || !folder.multiNoteMode) return;

    const newNote = {
        id: 'note-' + Date.now(),
        title: 'Untitled',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    folder.notes.unshift(newNote);
    expandedFolders.add(folderId);
    saveFolders();
    renderFolders();

    if (currentFolder === folderId) {
        selectNote(newNote.id);
        noteTitleInput.focus();
    }
}

function switchFolder(folderId) {
    saveCurrentContent();

    currentFolder = folderId;
    const folder = folders.find(f => f.id === folderId);
    currentFolderName.textContent = folder ? folder.name : 'Notes';

    updateEditorView();

    saveFolders();
    renderFolders();
    notesSidebar.classList.remove('open');
}

function selectNote(noteId) {
    saveCurrentContent();
    currentNoteId = noteId;
    const note = getCurrentNote();
    if (note) {
        noteTitleInput.value = note.title || '';
        notesArea.value = note.content || '';
    }
    renderFolders();
}

function deleteNote(event, noteId) {
    event.stopPropagation();

    if (!confirm('Delete this note?')) return;

    const folder = getCurrentFolder();
    if (!folder) return;

    folder.notes = folder.notes.filter(n => n.id !== noteId);

    if (currentNoteId === noteId) {
        const nextNote = folder.notes[0];
        if (nextNote) {
            selectNote(nextNote.id);
        } else {
            currentNoteId = null;
            noteTitleInput.value = '';
            notesArea.value = '';
        }
    }

    saveFolders();
    renderFolders();
}

// Auto-save on input
noteTitleInput.addEventListener('input', saveCurrentContent);
notesArea.addEventListener('input', saveCurrentContent);

// Folder management
const addFolderForm = document.getElementById('addFolderForm');
const newFolderInput = document.getElementById('newFolderInput');

function showAddFolderForm() {
    addFolderForm.classList.add('show');
    newFolderInput.value = '';
    newFolderInput.focus();
}

function hideAddFolderForm() {
    addFolderForm.classList.remove('show');
    newFolderInput.value = '';
}

function createFolder() {
    const name = newFolderInput.value.trim();
    if (name) {
        const id = 'folder-' + Date.now();
        folders.push({ id, name, multiNoteMode: false, content: '', notes: [] });
        saveFolders();
        renderFolders();
        hideAddFolderForm();
        switchFolder(id);
    }
}

newFolderInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createFolder();
});

newFolderInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAddFolderForm();
});

function deleteFolder(event, folderId) {
    event.stopPropagation();

    if (confirm('Delete this folder and all its notes?')) {
        folders = folders.filter(f => f.id !== folderId);

        if (currentFolder === folderId) {
            switchFolder('general');
        } else {
            saveFolders();
            renderFolders();
        }
    }
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.notes-sidebar') &&
        !e.target.closest('.notes-menu-btn') &&
        notesSidebar.classList.contains('open')) {
        notesSidebar.classList.remove('open');
    }
});

// Initialize
renderFolders();
const initialFolder = folders.find(f => f.id === currentFolder);
currentFolderName.textContent = initialFolder ? initialFolder.name : 'Notes';
updateEditorView();
