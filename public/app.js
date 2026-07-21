const API_URL = '/graphql';

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t);
    const assigned_user = document.getElementById('assignedUser').value;
    const project_id = document.getElementById('projectId').value;

    const query = `
        mutation CreateTask($input: CreateTaskInput!) {
            createTask(createTaskInput: $input) {
                id
            }
        }
    `;

    const variables = {
        input: { title, description, tags, assigned_user, project_id }
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        const { data, errors } = await res.json();
        if (errors) throw new Error(errors[0].message);
        
        document.getElementById('taskForm').reset();
        fetchTasks();
    } catch (err) {
        alert('Error creating task: ' + err.message);
    }
});

async function fetchTasks() {
    const query = `
        query {
            tasks {
                id
                title
                description
                status
                tags
                assigned_user
                project_id
            }
        }
    `;
    
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const { data } = await res.json();
        renderTasks(data.tasks);
    } catch (err) {
        console.error('Error fetching tasks', err);
    }
}

async function updateStatus(id, newStatus) {
    const query = `
        mutation UpdateTask($input: UpdateTaskInput!) {
            updateTask(updateTaskInput: $input) {
                id
                status
            }
        }
    `;
    
    const variables = { input: { id, status: newStatus } };
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
    } catch (err) {
        alert('Error updating status: ' + err.message);
        fetchTasks(); // revert visually
    }
}

function renderTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        
        const tagsHtml = task.tags.map(t => `<span class="tag">${t}</span>`).join('');
        
        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-id">#${task.id}</div>
            </div>
            <div class="task-desc">${task.description}</div>
            <div class="task-meta">
                ${tagsHtml}
            </div>
            <div class="task-footer">
                <select class="status-select" onchange="updateStatus('${task.id}', this.value)">
                    <option value="backlog" ${task.status === 'backlog' ? 'selected' : ''}>Backlog</option>
                    <option value="to_do" ${task.status === 'to_do' ? 'selected' : ''}>To Do</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                </select>
                <div class="user-badge">👤 ${task.assigned_user}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initial fetch
fetchTasks();
