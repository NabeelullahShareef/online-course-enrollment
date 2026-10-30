// ============================================================
// Frontend logic — talks to the backend API and updates the page
// ============================================================
const form = document.getElementById('enrollForm');
const formMessage = document.getElementById('formMessage');
const tableBody = document.getElementById('enrollmentTable');
const statsEl = document.getElementById('stats');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');

// Load enrollments from the API and render them in the table
async function loadEnrollments() {
  const params = new URLSearchParams();
  if (courseFilter.value) params.set('course', courseFilter.value);
  if (searchInput.value) params.set('search', searchInput.value);

  const res = await fetch('/api/enrollments?' + params.toString());
  const rows = await res.json();

  tableBody.innerHTML = rows.length
    ? rows
        .map(
          (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(r.fullName)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.course)}</td>
        <td>${escapeHtml(r.batch)}</td>
        <td>${escapeHtml(r.createdAt)}</td>
        <td><button onclick="deleteEnrollment(${r.id})">Delete</button></td>
      </tr>`
        )
        .join('')
    : '<tr><td colspan="7">No enrollments yet.</td></tr>';
}

// Load stats (total + per-course counts)
async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  statsEl.textContent =
    `Total enrollments: ${data.total}` +
    (data.byCourse.length
      ? '  |  ' + data.byCourse.map((c) => `${c.course}: ${c.c}`).join('  •  ')
      : '');
}

// Prevent user input from breaking the page (XSS safety)
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

// Delete an enrollment (called from the Delete button)
async function deleteEnrollment(id) {
  if (!confirm('Delete this enrollment?')) return;
  await fetch('/api/enrollments/' + id, { method: 'DELETE' });
  loadEnrollments();
  loadStats();
}

// Handle form submission: send data to the backend API
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch('/api/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();

  if (!res.ok) {
    formMessage.textContent = result.error || 'Something went wrong.';
    formMessage.className = 'message error';
    return;
  }

  formMessage.textContent = '🎉 Enrollment successful! Welcome aboard, ' + result.fullName + '.';
  formMessage.className = 'message success';
  form.reset();
  loadEnrollments();
  loadStats();
});

searchInput.addEventListener('input', loadEnrollments);
courseFilter.addEventListener('change', loadEnrollments);

loadEnrollments();
loadStats();
