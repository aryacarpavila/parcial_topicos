const API_URL = '/graphql';
let tags = [];

// =====================
// TAG MANAGEMENT
// =====================
const tagInput      = document.getElementById('tagInput');
const tagsContainer = document.getElementById('tagsContainer');

tagInput.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
    e.preventDefault();
    addTag(tagInput.value.trim());
    tagInput.value = '';
  }
});

function addTag(value) {
  if (!value || tags.includes(value)) return;
  tags.push(value);
  renderTags();
}

function removeTag(value) {
  tags = tags.filter(t => t !== value);
  renderTags();
}

function renderTags() {
  tagsContainer.innerHTML = '';
  tags.forEach(t => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${t}<button type="button" onclick="removeTag('${t}')">×</button>`;
    tagsContainer.appendChild(chip);
  });
}

// =====================
// LIVE DATE PREVIEW
// =====================
const datePreview = document.getElementById('previewDate');
datePreview.textContent = new Date().toLocaleString();

// =====================
// FORM SUBMIT
// =====================
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title         = document.getElementById('title').value.trim();
  const description   = document.getElementById('description').value.trim();
  const assigned_user = document.getElementById('assignedUser').value.trim();
  const project_id    = document.getElementById('projectId').value.trim();

  const query = `
    mutation CreateTask($input: CreateTaskInput!) {
      createTask(createTaskInput: $input) {
        id
        title
        description
        status
        tags
        created_at
        assigned_user
        project_id
      }
    }
  `;

  const variables = {
    input: { title, description, tags: [...tags], assigned_user, project_id }
  };

  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query, variables })
    });
    const { data, errors } = await res.json();
    if (errors) throw new Error(errors[0].message);

    // Reset form
    document.getElementById('taskForm').reset();
    tags = [];
    renderTags();
    fetchTasks();

  } catch (err) {
    alert('Error creating task: ' + err.message);
  }
});

// =====================
// FETCH ALL TASKS
// =====================
async function fetchTasks() {
  const query = `
    query {
      tasks {
        id
        title
        description
        status
        tags
        created_at
        assigned_user
        project_id
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query })
    });
    const { data } = await res.json();
    renderCards(data.tasks);
  } catch (err) {
    console.error('Error fetching tasks', err);
  }
}

// =====================
// UPDATE STATUS
// =====================
async function updateStatus(id, newStatus) {
  const query = `
    mutation UpdateTask($input: UpdateTaskInput!) {
      updateTask(updateTaskInput: $input) { id status }
    }
  `;
  const variables = { input: { id, status: newStatus } };

  try {
    await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query, variables })
    });
  } catch (err) {
    alert('Error updating status: ' + err.message);
    fetchTasks();
  }
}

// =====================
// RENDER TASK CARDS
// =====================
function statusLabel(status) {
  const map = { backlog: 'Backlog', to_do: 'To Do', in_progress: 'In Progress', done: 'Done' };
  return map[status] || status;
}

function renderCards(tasks) {
  const container = document.getElementById('tasksContainer');
  const emptyMsg  = document.getElementById('emptyMsg');
  container.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  tasks.forEach(task => {
    const tagsHtml = (task.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('');
    const date     = new Date(task.created_at).toLocaleDateString();

    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${task.title}</div>
        <div class="card-id">#${task.id}</div>
      </div>
      <div class="card-desc">${task.description}</div>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-footer">
        <select class="card-status-select" onchange="updateStatus('${task.id}', this.value)">
          <option value="backlog"     ${task.status==='backlog'     ?'selected':''}>Backlog</option>
          <option value="to_do"       ${task.status==='to_do'       ?'selected':''}>To Do</option>
          <option value="in_progress" ${task.status==='in_progress' ?'selected':''}>In Progress</option>
          <option value="done"        ${task.status==='done'        ?'selected':''}>Done</option>
        </select>
        <div class="card-meta">
          <span class="card-user">👤 ${task.assigned_user}</span>
          <span class="card-project">📁 ${task.project_id}</span>
          <span class="card-date">📅 ${date}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// =====================
// INIT
// =====================
fetchTasks();
