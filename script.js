const KEY = 'task-manager-v1';
let tasks = JSON.parse(localStorage.getItem(KEY) || '[]');
let filter = 'all';

const $ = id => document.getElementById(id);
const form = $('taskForm');
const input = $('taskInput');
const priority = $('priority');
const list = $('taskList');
const empty = $('emptyState');

const now = new Date();
$('today').textContent = new Intl.DateTimeFormat(undefined, {weekday:'long', month:'long', day:'numeric', year:'numeric'}).format(now);

const quotes = [
  'Small moves. Big terrain. Keep going.',
  'One waypoint at a time.',
  'Progress beats perfect plans.',
  'Clear route. Clear mind.',
  'Today is a good day to move forward.'
];
$('quote').textContent = quotes[now.getDate() % quotes.length];

function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); render(); }
function escapeHtml(value){ const d=document.createElement('div'); d.textContent=value; return d.innerHTML; }
function visibleTasks(){ return tasks.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done); }

function render(){
  const visible = visibleTasks();
  list.innerHTML = visible.map(t => `
    <article class="task ${t.done?'done':''}" data-id="${t.id}">
      <button class="check" aria-label="${t.done?'Mark incomplete':'Mark complete'}"></button>
      <div class="task-body">
        <div class="task-title">${escapeHtml(t.title)}</div>
        <div class="meta"><span class="priority ${t.priority}">${t.priority}</span><span>${new Date(t.created).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>
      </div>
      <button class="delete" aria-label="Delete task" title="Delete task">×</button>
    </article>`).join('');

  empty.hidden = visible.length !== 0;
  const total=tasks.length, done=tasks.filter(t=>t.done).length, active=total-done;
  $('totalCount').textContent=total;
  $('activeCount').textContent=active;
  $('doneCount').textContent=done;
  const pct=total ? Math.round(done/total*100) : 0;
  $('progressText').textContent=pct+'%';
  $('progressBar').style.width=pct+'%';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const title=input.value.trim();
  if(!title) return;
  tasks.unshift({id:crypto.randomUUID(), title, priority:priority.value, done:false, created:Date.now()});
  input.value='';
  priority.value='medium';
  save();
  input.focus();
});

list.addEventListener('click', e => {
  const task=e.target.closest('.task');
  if(!task) return;
  const id=task.dataset.id;
  if(e.target.closest('.check')){
    const t=tasks.find(x=>x.id===id);
    if(t) t.done=!t.done;
    save();
  }
  if(e.target.closest('.delete')){
    tasks=tasks.filter(x=>x.id!==id);
    save();
  }
});

document.querySelector('.filters').addEventListener('click', e => {
  const btn=e.target.closest('.filter');
  if(!btn) return;
  filter=btn.dataset.filter;
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===btn));
  render();
});

$('clearCompleted').addEventListener('click',()=>{
  tasks=tasks.filter(t=>!t.done);
  save();
});

$('resetAll').addEventListener('click',()=>{
  if(confirm('Delete every waypoint? This cannot be undone.')){
    tasks=[];
    save();
  }
});

render();