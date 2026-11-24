const API = '/api/tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('title');
const list = document.getElementById('list');
const counter = document.getElementById('counter');
const message = document.getElementById('message');
const filterButtons = document.querySelectorAll('.filters button');

let tasks = [];
let filter = 'all';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Помилка ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function showError(err) {
  message.textContent = err.message;
  message.hidden = false;
  setTimeout(() => { message.hidden = true; }, 3000);
}

async function loadTasks() {
  try {
    tasks = await request(API);
    render();
  } catch (err) {
    showError(err);
  }
}

function render() {
  const visible = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  list.innerHTML = '';

  if (!visible.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Завдань немає';
    list.append(li);
  }

  for (const task of visible) {
    const li = document.createElement('li');
    li.classList.toggle('done', task.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.title = 'Позначити виконаним';
    checkbox.addEventListener('change', () => updateTask(task.id, { done: checkbox.checked }));

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = task.title;
    title.addEventListener('dblclick', () => startEdit(li, task));

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Редагувати';
    editBtn.addEventListener('click', () => startEdit(li, task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Видалити';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, title, editBtn, deleteBtn);
    list.append(li);
  }

  const left = tasks.filter((t) => !t.done).length;
  counter.textContent = `Усього: ${tasks.length} · Активних: ${left}`;
}

function startEdit(li, task) {
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'edit-input';
  field.value = task.title;

  const title = li.querySelector('.title');
  title.replaceWith(field);
  field.focus();

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const value = field.value.trim();
    if (save && value && value !== task.title) {
      updateTask(task.id, { title: value });
    } else {
      render();
    }
  };

  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  field.addEventListener('blur', () => finish(true));
}

async function addTask(title) {
  try {
    const task = await request(API, { method: 'POST', body: JSON.stringify({ title }) });
    tasks.push(task);
    render();
  } catch (err) {
    showError(err);
  }
}

async function updateTask(id, changes) {
  try {
    const updated = await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
    tasks = tasks.map((t) => (t.id === id ? updated : t));
  } catch (err) {
    showError(err);
  }
  render();
}

async function deleteTask(id) {
  try {
    await request(`${API}/${id}`, { method: 'DELETE' });
    tasks = tasks.filter((t) => t.id !== id);
    render();
  } catch (err) {
    showError(err);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTask(title);
  input.value = '';
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

loadTasks();
