document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const taskList = document.querySelector('.task-list');
    const emptyState = document.querySelector('.empty-state');
    const fabButton = document.querySelector('.fab-button');
    const taskForm = document.querySelector('.task-form');
    const flashError = document.querySelector('.flash-error');
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

    let tasks = [];
    let taskToDelete = null;
    let taskToView = null;
    let previousView = null;

    // Funciones auxiliares
    const toggleModal = (modal, show) => {
        modal.style.display = show ? 'flex' : 'none';
    };

    const showFlashError = (message) => {
        flashError.textContent = message;
        flashError.style.display = 'block';
        setTimeout(() => flashError.style.display = 'none', 3000);
    };

    const updateFabButtonVisibility = () => {
        fabButton.style.display = (taskList.style.display === 'block' || emptyState.style.display === 'flex') ? 'block' : 'none';
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            emptyState.style.display = 'flex';
            taskList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            taskList.style.display = 'block';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = task.completed ? 'completed' : '';
                li.innerHTML =
                    <div class="task-summary">
                        <div class="task-info">
                            <i class="${getIconClass(task.category)} category-icon"></i>
                            <span class="task-name">${task.name}</span>
                        </div>
                        <div class="buttons">
                            <button class="view-btn" data-index="${index}">Ver detalles</button>
                            <button class="complete-btn" data-index="${index}">✔</button>
                            <button class="delete-btn" data-index="${index}">🗑️</button>
                        </div>
                    </div>
                    ;
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
        emptyState.style.display = 'none';
        fabButton.style.display = show ? 'none' : 'block';
    };

    const handleTaskAddition = () => {
        const taskName = taskNameInput.value.trim();
        const taskCategory = categorySelect.value;
        const taskDescription = taskDescriptionInput.value.trim();

        if (taskName && taskCategory && taskDescription) {
            tasks.push({ name: taskName, category: taskCategory, description: taskDescription, completed: false });
            handleFormVisibility(false);
            taskNameInput.value = '';
            categorySelect.value = '';
            taskDescriptionInput.value = '';
            renderTasks();
        } else {
            showFlashError('Por favor, completa todos los campos.');
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
            taskList.style.display = 'none';
            fabButton.style.display = 'none';
        }
    };

    const handleDeleteConfirmation = () => {
        if (taskToDelete !== null) {
            tasks.splice(taskToDelete, 1);
            taskToDelete = null;
            renderTasks();
            toggleModal(confirmDialog, false);
            updateFabButtonVisibility();
        }
    };

    const toggleComplete = (index) => {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    };

    const handleCancelDelete = () => {
        toggleModal(confirmDialog, false);
        if (previousView === 'taskDetails') {
            toggleModal(taskDetails, true);
            taskList.style.display = 'none';
        } else if (previousView === 'taskList') {
            renderTasks();
        }
        updateFabButtonVisibility();
    };

    const closeDetailsAndUpdateFab = () => {
        toggleModal(taskDetails, false);
        taskList.style.display = 'block';
        updateFabButtonVisibility();
    };

    // Event Listeners
    fabButton.addEventListener('click', () => handleFormVisibility(true));
    backButton.addEventListener('click', () => handleFormVisibility(false));
    addTaskButton.addEventListener('click', handleTaskAddition);

    taskList.addEventListener('click', (event) => {
        const index = event.target.dataset.index;
        if (event.target.classList.contains('view-btn')) {
            showTaskDetails(index);
        } else if (event.target.classList.contains('complete-btn')) {
            toggleComplete(index);
        } else if (event.target.classList.contains('delete-btn')) {
            taskToDelete = index;
            previousView = 'taskList';
            toggleModal(confirmDialog, true);
            taskList.style.display = 'none';
            fabButton.style.display = 'none';
        }
    });

    confirmDeleteButton.addEventListener('click', handleDeleteConfirmation);
    cancelDeleteButton.addEventListener('click', handleCancelDelete);
    closeDetailsButton.addEventListener('click', closeDetailsAndUpdateFab);
    deleteTaskButton.addEventListener('click', () => {
        if (taskToView !== null) {
            taskToDelete = taskToView;
            toggleModal(taskDetails, false);
            toggleModal(confirmDialog, true);
            previousView = 'taskDetails';
        }
    });

    // Render inicial
    renderTasks();
})