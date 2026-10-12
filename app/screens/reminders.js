// app/screens/reminders.js
// Напоминания: CRUD + push-уведомления.

import { state, saveState, isPrem } from '../state.js';
import { shortId, formatDate, todayISO } from '../utils.js';
import { showToast } from '../ui.js';

export function renderReminders() {
  const b = document.getElementById('remindersContent');
  if (!b) return;
  if (!isPrem()) {
    b.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>Только в Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>';
    return;
  }
  const items = state.reminders || [];
  b.innerHTML = `<button class="btn mb-16" onclick="openReminderModal()">+ Добавить</button>
    ${items.length === 0
      ? '<div style="text-align:center;padding:40px;color:var(--text-dim);">🔕 Нет</div>'
      : items.map(r => `<div class="task-card">
          <div class="task-content">
            <div class="task-text">${escapeHtmlLocal(r.text)}</div>
            <div class="task-meta"><span>📅 ${formatDate(r.date)} ${r.time}</span></div>
          </div>
          <button class="icon-btn icon-btn-sm" onclick="deleteReminder('${r.id}')">🗑</button>
        </div>`).join('')}`;
}

function escapeHtmlLocal(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function openReminderModal() {
  if (!isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  document.getElementById('reminderModal').classList.add('active');
  document.getElementById('reminderText').value = '';
  document.getElementById('reminderDate').value = todayISO();
  document.getElementById('reminderTime').value = '09:00';
}

export function saveReminder() {
  const t = document.getElementById('reminderText').value.trim();
  if (!t) return;
  state.reminders.push({
    id: shortId(),
    text: t,
    date: document.getElementById('reminderDate').value,
    time: document.getElementById('reminderTime').value,
    repeat: document.getElementById('reminderRepeat').value
  });
  saveState();
  if (typeof window.closeModal === 'function') window.closeModal('reminderModal');
  renderReminders();
  showToast('✅ Создано', 'success');
}

export function deleteReminder(id) {
  state.reminders = state.reminders.filter(x => x.id !== id);
  saveState();
  renderReminders();
}

export function requestNotificationPermission() {
  const s = document.getElementById('pushStatus');
  if (!('Notification' in window)) {
    if (s) s.textContent = 'Не поддерживается';
    return;
  }
  if (Notification.permission === 'granted') {
    if (s) s.textContent = '✅';
    return;
  }
  Notification.requestPermission().then(p => {
    if (s) s.textContent = p === 'granted' ? '✅' : '❌';
    if (p === 'granted') {
      showToast('✅ Push разрешены', 'success');
      new Notification('Номи', { body: 'Включено!' });
    }
  });
}

export function checkRemindersPush() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const cur = `${hh}:${mm}`;
  const today = todayISO();
  (state.reminders || []).forEach(r => {
    if (r.date === today && r.time === cur && !r.notified) {
      r.notified = true;
      new Notification('Номи', { body: r.text });
      saveState();
    }
  });
}