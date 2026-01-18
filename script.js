/* --- STATE MANAGEMENT --- */
const defaultEvents = [
    { id: 1, name: "Tech Symposium", date: "2026-05-20", time: "10:00", type: "Technical", venue: "Hall A" },
    { id: 2, name: "Cultural Night", date: "2026-05-22", time: "18:00", type: "Cultural", venue: "Auditorium" },
    { id: 3, name: "Soccer Cup", date: "2026-06-01", time: "09:00", type: "Sports", venue: "Main Ground" }
];

let events = JSON.parse(localStorage.getItem('events')) || defaultEvents;
let registrations = JSON.parse(localStorage.getItem('registrations')) || [];

function saveData() {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('registrations', JSON.stringify(registrations));
}

/* --- NAVIGATION --- */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    // Show target section
    document.getElementById(sectionId + '-section').classList.remove('d-none');

    // Trigger specific renders
    if (sectionId === 'events') renderEvents();
    if (sectionId === 'register') renderRegisterOptions();
    if (sectionId === 'admin') checkAdminLogin();
    
    // Collapse mobile navbar if open
    const navBar = document.getElementById('navbarNav');
    if (navBar.classList.contains('show')) {
        new bootstrap.Collapse(navBar).hide();
    }
}

/* --- EVENTS PAGE --- */
function renderEvents() {
    const container = document.getElementById('events-container');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    container.innerHTML = '';

    const filtered = events.filter(e => {
        return e.name.toLowerCase().includes(search) && 
               (cat === 'All' || e.type === cat);
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No events found.</div>';
        return;
    }

    filtered.forEach(e => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <span class="badge bg-info text-dark mb-2">${e.type}</span>
                    <h5 class="card-title">${e.name}</h5>
                    <p class="card-text text-muted small">
                        📅 ${e.date} at ${e.time} <br>
                        📍 ${e.venue}
                    </p>
                    <button class="btn btn-primary w-100" onclick="preFillRegister('${e.name}')">Register</button>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// Event Listeners for Filter
document.getElementById('searchInput').addEventListener('input', renderEvents);
document.getElementById('categoryFilter').addEventListener('change', renderEvents);

/* --- REGISTRATION PAGE --- */
function renderRegisterOptions() {
    const select = document.getElementById('eventSelect');
    select.innerHTML = '<option value="" disabled selected>Choose an event...</option>';
    events.forEach(e => {
        select.innerHTML += `<option value="${e.name}">${e.name} (${e.date})</option>`;
    });
}

function preFillRegister(eventName) {
    showSection('register');
    // Allow slight delay for DOM update
    setTimeout(() => {
        renderRegisterOptions(); // ensure options are loaded
        document.getElementById('eventSelect').value = eventName;
    }, 50);
}

document.getElementById('registrationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newReg = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        roll: document.getElementById('studentRoll').value,
        dept: document.getElementById('studentDept').value,
        eventName: document.getElementById('eventSelect').value,
        regDate: new Date().toLocaleDateString()
    };
    
    registrations.push(newReg);
    saveData();
    alert('Registration Successful!');
    e.target.reset();
    showSection('home');
});

/* --- ADMIN PANEL --- */
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        document.getElementById('admin-login-view').classList.add('d-none');
        document.getElementById('admin-dashboard-view').classList.remove('d-none');
        renderAdminData();
    } else {
        document.getElementById('admin-login-view').classList.remove('d-none');
        document.getElementById('admin-dashboard-view').classList.add('d-none');
    }
}

function adminLogin() {
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;
    if (u === 'admin' && p === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        checkAdminLogin();
    } else {
        alert('Invalid Credentials! (Try: admin / admin123)');
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    checkAdminLogin();
}

function renderAdminData() {
    // Render Event List
    const evtBody = document.getElementById('adminEventTable');
    evtBody.innerHTML = '';
    events.forEach((e, idx) => {
        evtBody.innerHTML += `
            <tr>
                <td>${e.name}</td>
                <td>${e.date}</td>
                <td>${e.type}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteEvent(${idx})">Delete</button></td>
            </tr>
        `;
    });

    // Render Registration List
    const regBody = document.getElementById('adminRegTable');
    regBody.innerHTML = '';
    registrations.forEach(r => {
        regBody.innerHTML += `
            <tr>
                <td>${r.name}</td>
                <td>${r.roll}</td>
                <td>${r.email}</td>
                <td>${r.eventName}</td>
            </tr>
        `;
    });
}

// Add Event
document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newEvt = {
        id: Date.now(),
        name: document.getElementById('newEventName').value,
        date: document.getElementById('newEventDate').value,
        time: document.getElementById('newEventTime').value,
        type: document.getElementById('newEventType').value,
        venue: "TBD" // simplified for layout
    };
    events.push(newEvt);
    saveData();
    renderAdminData();
    e.target.reset();
});

// Delete Event
window.deleteEvent = function(index) {
    if(confirm('Delete this event?')) {
        events.splice(index, 1);
        saveData();
        renderAdminData();
    }
};

// Admin Tab Switch
window.switchAdminTab = function(tabName) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('d-none'));
    document.getElementById('tab-' + tabName).classList.remove('d-none');
    
    // Update active button state
    document.querySelectorAll('#adminTabs .nav-link').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
};

// CSV Export
function exportCSV() {
    let csv = "Name,Roll,Email,Dept,Event,Date\n";
    registrations.forEach(r => {
        csv += `${r.name},${r.roll},${r.email},${r.dept},${r.eventName},${r.regDate}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
}

/* --- DARK MODE --- */
const themeToggle = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️ Mode';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️ Mode' : '🌙 Mode';
});

// Initial Load
showSection('home');