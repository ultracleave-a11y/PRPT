
// Lógica de la aplicación en Vanilla JavaScript (Módulo ES6)

// --- ESTADO ---
let problems = JSON.parse(localStorage.getItem('sp_problems') || '[]');
let currentUser = sessionStorage.getItem('sp_admin_auth') === 'true';

// --- ELEMENTOS DEL DOM ---
const views = {
    student: document.getElementById('student-view'),
    login: document.getElementById('login-view'),
    admin: document.getElementById('admin-view'),
    success: document.getElementById('success-view')
};

const nav = {
    student: document.getElementById('btn-view-student'),
    login: document.getElementById('btn-view-login'),
    logout: document.getElementById('btn-logout'),
    logo: document.getElementById('nav-logo')
};

// --- NAVEGACIÓN ---
function switchView(viewName: string) {
    Object.keys(views).forEach(key => {
        const view = (views as any)[key];
        if (view) view.classList.toggle('active', key === viewName);
    });
    
    // Actualizar botones de navegación
    if (nav.student) nav.student.classList.toggle('active', viewName === 'student');
    if (nav.login) nav.login.classList.toggle('active', viewName === 'login' || viewName === 'admin');

    if (viewName === 'admin') {
        renderAdmin();
    }
}

// --- LÓGICA DE ESTUDIANTE ---
const problemForm = document.getElementById('problem-form');
const fileInput = document.getElementById('std-file');
const imgPreview = document.getElementById('image-preview');

if (fileInput) {
    // Fix: Cast e.target to HTMLInputElement to access 'files' property
    fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files ? target.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                // Fix: Cast imgPreview to HTMLImageElement to access 'src' property
                if (imgPreview && ev.target) {
                    (imgPreview as HTMLImageElement).src = ev.target.result as string;
                    (imgPreview as HTMLElement).style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

if (problemForm) {
    problemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Fix: Cast elements to HTMLInputElement to access 'value' property
        const name = (document.getElementById('std-name') as HTMLInputElement).value;
        const phone = (document.getElementById('std-phone') as HTMLInputElement).value;
        // Fix: Cast imgPreview to HTMLImageElement to access 'src' property
        const imageData = (imgPreview as HTMLImageElement).src;

        const newProblem = {
            id: Date.now(),
            name,
            phone,
            image: imageData,
            date: new Date().toLocaleString(),
            status: 'pending'
        };

        problems.unshift(newProblem);
        localStorage.setItem('sp_problems', JSON.stringify(problems));
        
        switchView('success');
    });
}

// --- LÓGICA DE ADMIN / LOGIN ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Fix: Cast elements to HTMLInputElement to access 'value' property
        const user = (document.getElementById('adm-user') as HTMLInputElement).value;
        const pass = (document.getElementById('adm-pass') as HTMLInputElement).value;

        if (user === 'admin' && pass === 'admin123') {
            currentUser = true;
            sessionStorage.setItem('sp_admin_auth', 'true');
            if (nav.logout) (nav.logout as HTMLElement).style.display = 'block';
            switchView('admin');
        } else {
            alert('Credenciales incorrectas (admin / admin123)');
        }
    });
}

if (nav.logout) {
    nav.logout.addEventListener('click', () => {
        currentUser = false;
        sessionStorage.removeItem('sp_admin_auth');
        (nav.logout as HTMLElement).style.display = 'none';
        switchView('student');
    });
}

// --- RENDERIZADO ADMIN ---
function renderAdmin() {
    const container = document.getElementById('problems-container');
    const statsText = document.getElementById('stats-text');
    
    if (!container || !statsText) return;
    
    container.innerHTML = '';
    statsText.textContent = `Tienes ${problems.length} solicitudes registradas.`;

    if (problems.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay ejercicios pendientes.</div>';
        return;
    }

    problems.forEach((p: any) => {
        const item = document.createElement('div');
        item.className = 'problem-item';
        
        const waText = encodeURIComponent(`Hola ${p.name}, soy de SolverPro respecto a tu ejercicio.`);
        const waLink = `https://wa.me/${p.phone.replace(/\D/g, '')}?text=${waText}`;

        item.innerHTML = `
            <img src="${p.image}" class="problem-img" onclick="window.open(this.src)">
            <div class="problem-info">
                <h4>${p.name}</h4>
                <p>📞 ${p.phone}</p>
                <p>📅 ${p.date}</p>
            </div>
            <div class="actions">
                <a href="${waLink}" target="_blank" class="btn btn-sm btn-wa">WhatsApp</a>
                <button class="btn btn-sm btn-del" data-id="${p.id}">Borrar</button>
            </div>
        `;
        container.appendChild(item);
    });

    // Delegación de eventos para borrar
    // Fix: Cast btn to HTMLElement to access 'onclick' and 'dataset' properties
    container.querySelectorAll('.btn-del').forEach(btn => {
        (btn as HTMLElement).onclick = () => {
            const id = parseInt((btn as HTMLElement).dataset.id || '0');
            if(confirm('¿Seguro que quieres eliminar este registro?')) {
                problems = problems.filter((x: any) => x.id !== id);
                localStorage.setItem('sp_problems', JSON.stringify(problems));
                renderAdmin();
            }
        };
    });
}

// --- INICIALIZACIÓN ---
if (nav.student) (nav.student as HTMLElement).onclick = () => switchView('student');
if (nav.logo) (nav.logo as HTMLElement).onclick = () => switchView('student');
if (nav.login) {
    (nav.login as HTMLElement).onclick = () => {
        if (currentUser) switchView('admin');
        else switchView('login');
    };
}

if (currentUser && nav.logout) {
    (nav.logout as HTMLElement).style.display = 'block';
}

// Iniciar en vista estudiante por defecto
switchView('student');
