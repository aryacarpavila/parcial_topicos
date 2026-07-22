const API_URL = '/graphql';
let tags = [];
let tasks = [];
let editingTaskId = null;

const taskForm = document.getElementById('taskForm');
const formTitle = document.getElementById('formTitle');
const submitButton = document.getElementById('submitButton');
const cancelEditButton = document.getElementById('cancelEditButton');

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
// FORM SUBMIT
// =====================
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title         = document.getElementById('title').value.trim();
  const description   = document.getElementById('description').value.trim();
  const status        = document.getElementById('status').value;
  const assigned_user = document.getElementById('assignedUser').value.trim();
  const project_id    = document.getElementById('projectId').value.trim();

  const isEditing = editingTaskId !== null;
  const query = isEditing
    ? `
      mutation UpdateTask($input: UpdateTaskInput!) {
        updateTask(updateTaskInput: $input) {
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
    `
    : `
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
    input: {
      ...(isEditing ? { id: editingTaskId } : {}),
      title,
      description,
      status,
      tags: [...tags],
      assigned_user,
      project_id
    }
  };

  try {
    await executeGraphQL(query, variables);
    resetForm();
    await fetchTasks();
  } catch (err) {
    const action = isEditing ? 'updating' : 'creating';
    alert(`Error ${action} task: ${err.message}`);
  }
});

cancelEditButton.addEventListener('click', resetForm);

function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  tags = [];
  renderTags();
  formTitle.textContent = 'Create New Task';
  submitButton.textContent = 'Create Task';
  cancelEditButton.hidden = true;
}

function startEditTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  editingTaskId = task.id;
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('status').value = task.status;
  document.getElementById('assignedUser').value = task.assigned_user;
  document.getElementById('projectId').value = task.project_id;
  tags = [...task.tags];
  renderTags();

  formTitle.textContent = 'Edit Task';
  submitButton.textContent = 'Save Changes';
  cancelEditButton.hidden = false;
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function executeGraphQL(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || 'GraphQL request failed');
  }

  return result.data;
}

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
    const data = await executeGraphQL(query);
    tasks = data.tasks;
    renderCards(tasks);
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
    await executeGraphQL(query, variables);
    await fetchTasks();
  } catch (err) {
    alert('Error updating status: ' + err.message);
    fetchTasks();
  }
}

// =====================
// RENDER TASK CARDS
// =====================
function statusLabel(status) {
  const map = { BACKLOG: 'Backlog', TO_DO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
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
        <div class="card-actions">
          <button type="button" class="btn-edit" onclick="startEditTask('${task.id}')">Edit</button>
          <div class="card-id">#${task.id}</div>
        </div>
      </div>
      <div class="card-desc">${task.description}</div>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-footer">
        <select class="card-status-select" onchange="updateStatus('${task.id}', this.value)">
          <option value="BACKLOG"     ${task.status==='BACKLOG'     ?'selected':''}>Backlog</option>
          <option value="TO_DO"       ${task.status==='TO_DO'       ?'selected':''}>To Do</option>
          <option value="IN_PROGRESS" ${task.status==='IN_PROGRESS' ?'selected':''}>In Progress</option>
          <option value="DONE"        ${task.status==='DONE'        ?'selected':''}>Done</option>
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
