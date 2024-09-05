document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const taskList = document.querySelector('.task-list');
    const emptyState = document.querySelector('.empty-state');
    const fabButton = document.querySelector('.fab-button');
    const taskForm = document.querySelector('.task-form');
    const taskNameInput = document.getElementById('taskName');
    const categorySelect = document.getElementById('taskCategory');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const addTaskButton = document.getElementById('addTask');
    const backButton = document.getElementById('goBack');
    const confirmDialog = document.getElementById('confirmDialog');
    const taskDetails = document.getElementById('taskDetails');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const deleteTaskButton = document.getElementById('deleteTask');
    const closeDetailsButton = document.getElementById('closeDetails');
    const authContainer = document.querySelector('.auth-container');
    const taskContainer = document.querySelector('.task-container');
    const header = document.getElementById('header');

    const user = document.getElementById('username');
    const password = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const welcomeMessage = document.querySelector('.welcome-message');
    const logoutButton = document.getElementById('logoutButton');

    const inspirationalQuotes = [
        "La vida es 10% lo que te ocurre y 90% cómo reaccionas a ello.",
        "El único modo de hacer un gran trabajo es amar lo que haces.",
        "No cuentes los días, haz que los días cuenten.",
        "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
        "No te rindas, cada fracaso es una oportunidad para empezar de nuevo con más experiencia.",
        "Cree en ti mismo y todo será posible.",
        "El futuro pertenece a aquellos que creen en la belleza de sus sueños.",
        "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden."
    ];


    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let taskToDelete = null;
    let taskToView = null;
    let previousView = null;
    let usersList = JSON.parse(localStorage.getItem("localSave")) || [];

    // Ocultar por defecto
    taskContainer.style.display = 'none';
    header.style.display = 'none';
    fabButton.style.display = 'none';
    taskForm.style.display = 'none';
    taskDetails.style.display = 'none';
    confirmDialog.style.display = 'none';


    const showWelcomeMessage = (username) => {
        welcomeMessage.textContent = `To Do List de ${username}`;
    };

    // Verificar si el usuario ya tiene una sesión iniciada
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        authContainer.style.display = 'none';
        taskContainer.style.display = 'block';
        header.style.display = 'flex';
        fabButton.style.display = 'block';
        showWelcomeMessage(currentUser);  // Mostrar mensaje de bienvenida

    }

    // Registro de usuario
    registerButton.addEventListener("click", () => {
        const username = user.value.trim();
        const userPassword = password.value.trim();

        if (!username || !userPassword) {
            showFlashError('Por favor, completa todos los campos.');
            return;
        }

        const userExists = usersList.some(user => user.username === username);

        if (userExists) {
            showFlashError('El usuario ya está registrado.');
        } else {
            let newUser = { username: username, password: userPassword };
            usersList.push(newUser);
            localStorage.setItem("localSave", JSON.stringify(usersList));
            localStorage.setItem('currentUser', username);
            tasks = loadTasks();
            renderTasks();
            authContainer.style.display = 'none';
            taskContainer.style.display = 'block';
            header.style.display = 'flex';
            fabButton.style.display = 'block';
            showWelcomeMessage(username);  // Mostrar mensaje de bienvenida

        }
    });

    // Inicio de sesión
    loginButton.addEventListener("click", () => {
        const username = user.value.trim();
        const userPassword = password.value.trim();

        if (!username || !userPassword) {
            showFlashError('Por favor, completa todos los campos.');
            return;
        }

        const loggedInUser = usersList.find(user => user.username === username && user.password === userPassword);

        if (loggedInUser) {
            localStorage.setItem('currentUser', username);
            tasks = loadTasks(); // Cargar tareas específicas para el usuario
            authContainer.style.display = 'none';
            taskContainer.style.display = 'block';
            header.style.display = 'flex';
            fabButton.style.display = 'block';
            renderTasks(); // Renderizar tareas después de iniciar sesión
            showWelcomeMessage(username);  // Mostrar mensaje de bienvenida


        } else {
            showFlashError('Nombre de usuario o contraseña incorrectos.');
        }
    });



    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        authContainer.style.display = 'block';
        taskContainer.style.display = 'none';
        header.style.display = 'none';
        fabButton.style.display = 'none';
        taskForm.style.display = 'none'; // Asegúrate de ocultar el formulario de tareas al cerrar sesión
        welcomeMessage.textContent = '';  // Limpiar el mensaje de bienvenida

    });

    // Funciones auxiliares

    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
        return `"${inspirationalQuotes[randomIndex]}"`;
    };

    const renderEmptyState = () => {
        emptyState.style.display = 'flex';
        taskList.style.display = 'none';
        const quoteElement = document.querySelector('.empty-state .quote');
        quoteElement.textContent = getRandomQuote();
    };


    const toggleModal = (modal, show) => {
        modal.style.display = show ? 'flex' : 'none';
        if (show) {
            modal.style.zIndex = '1000';
        }
    };

    const showFlashError = (message) => {
        const errorElements = document.querySelectorAll('.flash-error')
        for (const errorElement of errorElements) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => errorElement.style.display = 'none', 3000);
        }
    };

    const updateFabButtonVisibility = () => {
        fabButton.style.display = (taskList.style.display === 'block' || emptyState.style.display === 'flex') ? 'block' : 'none';
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            renderEmptyState(); // Llama a la función para mostrar la frase inspiradora
        } else {
            emptyState.style.display = 'none';
            taskList.style.display = 'block';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = task.completed ? 'completed' : '';
                li.innerHTML =
                    `<div class="task-summary">
                        <div class="task-info">
                            <i class="${getIconClass(task.category)} category-icon"></i>
                            <span class="task-name">${task.name}</span>
                        </div>
                        <div class="buttons">
                            <button class="view-btn" data-index="${index}">Ver detalles</button>
                            <button class="complete-btn" data-index="${index}">✔</button>
                            <button class="delete-btn" data-index="${index}">🗑️</button>
                        </div>
                    </div>`;
                taskList.appendChild(li);
            });
        }
        updateFabButtonVisibility();
    };

    const getIconClass = (category) => {
        switch (category) {
            case 'Work':
                return 'https://www.inspireuplift.com/resizer/?image=https://cdn.inspireuplift.com/uploads/images/seller_products/33104/1705828348_FlorkofcowsmemesCutSadFlork.png&width=600&height=600&quality=90&format=auto&fit=pad';
            case 'Home':
                return 'https://fbi.cults3d.com/uploaders/22627655/illustration-file/488103f0-ed90-4f92-b016-a3e56a4ea796/LlaveroPremio.jpg';
            case 'Studies':
                return 'https://i.pinimg.com/736x/2d/f7/a9/2df7a9fcb5d18374b4caced28f332f98.jpg';
            default:
                return '';
        }
    };

    const handleFormVisibility = (show) => {
        taskForm.style.display = show ? 'block' : 'none';
        taskList.style.display = show ? 'none' : 'block';
        emptyState.style.display = tasks.length === 0 && !show ? 'flex' : 'none'; // Muestra el estado vacío si no hay tareas
        fabButton.style.display = show ? 'none' : 'block';
    };

    const saveTasks = () => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
        }
    };

    const loadTasks = () => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            return JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        }
        return [];
    };

    const handleTaskAddition = () => {
        const taskName = taskNameInput.value.trim();
        const taskCategory = categorySelect.value;
        const taskDescription = taskDescriptionInput.value.trim();

        if (taskName && taskCategory && taskDescription) {
            const newTask = { name: taskName, category: taskCategory, description: taskDescription, completed: false };
            tasks.push(newTask);
            saveTasks();
            handleFormVisibility(false);
            taskNameInput.value = '';
            categorySelect.value = '';
            taskDescriptionInput.value = '';
            renderTasks();
        } else {
            showFlashError('Por favor, completa todos los campos.');
            return;
        }
    };

    const showTaskDetails = (index) => {
        const task = tasks[index];
        if (task) {
            document.getElementById('taskNameDetails').textContent = task.name;
            document.getElementById('taskCategoryImgContainer').innerHTML = `<img src="${getIconClass(task.category)}" alt="${task.category}">`;
            document.getElementById('taskDescriptionValue').textContent = task.description;
            taskToView = index;
            previousView = 'taskList';

            toggleModal(taskDetails, true);
        }
    };

    const handleDeleteTask = (index) => {
        taskToDelete = index;
        toggleModal(confirmDialog, true);
    };

    const handleDeleteConfirmation = () => {
        if (taskToDelete !== null) {
            tasks.splice(taskToDelete, 1);
            saveTasks();
            taskToDelete = null;
            toggleModal(confirmDialog, false);
            renderTasks();
        }
    };

    const handleCancelDelete = () => {
        taskToDelete = null;
        toggleModal(confirmDialog, false);
    };

    // Eventos
    fabButton.addEventListener('click', () => handleFormVisibility(true));

    addTaskButton.addEventListener('click', handleTaskAddition);

    backButton.addEventListener('click', () => handleFormVisibility(false));

    deleteTaskButton.addEventListener('click', () => {
        if (taskToView !== null) {
            handleDeleteTask(taskToView);
            taskToView = null;
            toggleModal(taskDetails, false);
        }
    });

    closeDetailsButton.addEventListener('click', () => {
        taskToView = null;
        toggleModal(taskDetails, false);
    });

    confirmDeleteButton.addEventListener('click', handleDeleteConfirmation);

    cancelDeleteButton.addEventListener('click', handleCancelDelete);

    // Manejo de clics en las tareas
    taskList.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('view-btn') && index !== undefined) {
            showTaskDetails(index);
        } else if (e.target.classList.contains('delete-btn') && index !== undefined) {
            handleDeleteTask(index);
        } else if (e.target.classList.contains('complete-btn') && index !== undefined) {
            tasks[index].completed = !tasks[index].completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            saveTasks();
            renderTasks();
        }
    });

    // Inicialización
    tasks = loadTasks()
    renderTasks();
});
