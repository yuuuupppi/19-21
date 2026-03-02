// Импорты модулей
import { fetchTasks, createTaskOnServer, updateTaskOnServer, deleteTaskFromServer } from './api.js';
import { 
    initializeTasks, getTasks, getTasksByFilter, addTask, 
    toggleTaskStatus, deleteTask, deleteCompletedTasks, 
    updateTaskPriority, getStats 
} from './tasks.js';
import { loadTasks, saveTasks, loadFilter, saveFilter } from './storage.js';

// ===== Инициализация приложения =====
let currentFilter = loadFilter();

// Получаем ссылки на DOM-элементы
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const filterContainer = document.getElementById('filterContainer');
const completedCountSpan = document.getElementById('completedCount');
const totalCountSpan = document.getElementById('totalCount');
const loadFromServerBtn = document.getElementById('loadFromServerBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Загружаем сохраненные задачи и инициализируем состояние
const savedTasks = loadTasks();
initializeTasks(savedTasks);

// ===== Вспомогательные функции =====

/**
 * Сохранение и перерисовка интерфейса
 */
const saveAndRender = () => {
    saveTasks(getTasks());
    renderTasks();
};

/**
 * Отрисовка списка задач
 */
const renderTasks = () => {
    // Получаем задачи по текущему фильтру
    const tasksToRender = getTasksByFilter(currentFilter);
    
    // Очищаем контейнер
    taskList.innerHTML = '';
    
    // Цвета для приоритетов
    const priorityColors = {
        low: 'bg-green-500',
        medium: 'bg-yellow-500',
        high: 'bg-red-500'
    };
    
    // Создаем элементы для каждой задачи
    tasksToRender.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item bg-gray-50 rounded-lg p-3 flex flex-col hover:shadow-md transition';
        li.dataset.id = task.id;
        
        const priorityColor = priorityColors[task.priority] || 'bg-zinc-600';
        
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" class="task-checkbox w-5 h-5" ${task.completed ? 'checked' : ''}>
                <span class="task-text flex-1 ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn text-gray-400 hover:text-red-600 transition">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="flex items-center gap-2 mt-1 ml-8">
                <span class="text-xs text-gray-500">Приоритет:</span>
                <span class="priority-badge w-3 h-3 rounded-full ${priorityColor}"></span>
                <span class="text-xs text-gray-600 capitalize">${task.priority}</span>
            </div>
        `;
        
        // Добавляем обработчик двойного клика для редактирования приоритета
        li.addEventListener('dblclick', (e) => {
            // Игнорируем двойной клик по чекбоксу или кнопке удаления
            if (e.target.closest('input[type="checkbox"]') || e.target.closest('.delete-btn')) {
                return;
            }
            
            const taskTextElement = li.querySelector('.task-text');
            startPriorityEdit(task, li, taskTextElement);
        });
        
        taskList.appendChild(li);
    });
    
    // Обновляем статистику
    const stats = getStats();
    completedCountSpan.textContent = stats.completed;
    totalCountSpan.textContent = stats.total;
};

/**
 * Редактирование приоритета задачи по двойному клику
 * @param {Object} task - Объект задачи
 * @param {HTMLElement} li - Элемент списка
 * @param {HTMLElement} taskTextElement - Элемент с текстом задачи
 */
const startPriorityEdit = (task, li, taskTextElement) => {
    // Создаем выпадающий список
    const select = document.createElement('select');
    select.className = 'ml-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    const priorities = ['low', 'medium', 'high'];
    const priorityLabels = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий'
    };
    
    priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priorityLabels[priority];
        if (task.priority === priority) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    // Вставляем select после текста задачи
    taskTextElement.insertAdjacentElement('afterend', select);
    taskTextElement.style.display = 'none'; // скрываем текст
    select.focus();
    
    // Функция сохранения приоритета
    const savePriority = () => {
        const newPriority = select.value;
        if (newPriority !== task.priority) {
            // Обновляем локально
            updateTaskPriority(task.id, newPriority);
            
            // Если задача с сервера (числовой ID), обновляем на сервере
            if (!isNaN(parseInt(task.id))) {
                updateTaskOnServer(parseInt(task.id), { priority: newPriority })
                    .catch(err => console.error('Ошибка обновления приоритета на сервере:', err));
            }
            
            saveAndRender();
        } else {
            // Убираем select и показываем текст
            select.remove();
            taskTextElement.style.display = 'inline';
        }
    };
    
    // Обработчики событий
    select.addEventListener('change', () => {
        savePriority();
    });
    
    select.addEventListener('blur', () => {
        savePriority();
    });
    
    select.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            savePriority();
        }
        if (e.key === 'Escape') {
            select.remove();
            taskTextElement.style.display = 'inline';
        }
    });
};

// ===== Обработчики событий =====

/**
 * Обработка изменения статуса задачи (через делегирование)
 */
taskList.addEventListener('change', async (e) => {
    if (e.target.classList.contains('task-checkbox')) {
        const li = e.target.closest('.task-item');
        if (!li) return;
        
        const id = li.dataset.id;
        
        // Обновляем локально
        toggleTaskStatus(id);
        
        // Если задача с сервера (числовой ID), обновляем на сервере
        if (!isNaN(parseInt(id))) {
            const task = getTasks().find(t => t.id === id);
            if (task) {
                try {
                    await updateTaskOnServer(parseInt(id), { completed: task.completed });
                } catch (error) {
                    console.error('Ошибка обновления на сервере:', error);
                }
            }
        }
        
        saveAndRender();
    }
});

/**
 * Обработка удаления задачи (через делегирование)
 */
taskList.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;
    
    const li = deleteBtn.closest('.task-item');
    if (!li || !li.dataset.id) return;
    
    const id = li.dataset.id;
    
    // Удаляем локально
    deleteTask(id);
    
    // Если задача с сервера (числовой ID), удаляем на сервере
    if (!isNaN(parseInt(id))) {
        try {
            await deleteTaskFromServer(parseInt(id));
        } catch (error) {
            console.error('Ошибка удаления с сервера:', error);
        }
    }
    
    saveAndRender();
});

/**
 * Обработка отправки формы (добавление задачи)
 */
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) return;
    
    const priority = prioritySelect.value;
    
    // Добавляем задачу локально
    const newTask = addTask(text, priority);
    
    // Отправляем на сервер
    try {
        const serverTask = await createTaskOnServer({
            text: newTask.text,
            completed: newTask.completed
        });
        
        // Заменяем локальный ID на серверный с префиксом
        newTask.id = `server_${serverTask.id}`;
        newTask.serverId = serverTask.id;
        
    } catch (error) {
        console.error('Ошибка при создании задачи на сервере:', error);
        // Задача останется только локально
    }
    
    // Очищаем форму
    taskInput.value = '';
    prioritySelect.value = 'medium';
    
    saveAndRender();
});

/**
 * Обработка клика по фильтрам
 */
filterContainer.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return;
    
    const filter = filterBtn.dataset.filter;
    if (!filter) return;
    
    // Обновляем текущий фильтр
    currentFilter = filter;
    saveFilter(currentFilter);
    
    // Обновляем активное состояние кнопок
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
    
    // Перерисовываем задачи
    renderTasks();
});

/**
 * Обработка загрузки задач с сервера
 */
loadFromServerBtn.addEventListener('click', async () => {
    // Блокируем кнопку
    loadFromServerBtn.disabled = true;
    loadFromServerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    try {
        const serverTasks = await fetchTasks();
        
        // Получаем текущие задачи
        const currentTasks = getTasks();
        const currentTaskTexts = new Set(
            currentTasks.map(t => t.text.trim().toLowerCase())
        );
        
        let newTasksCount = 0;
        
        // Добавляем уникальные задачи с сервера
        serverTasks.forEach(serverTask => {
            const taskText = serverTask.title.trim();
            const taskTextLower = taskText.toLowerCase();
            
            if (!currentTaskTexts.has(taskTextLower)) {
                // Создаем задачу локально
                const newTask = addTask(taskText, 'medium');
                newTask.completed = serverTask.completed;
                newTask.id = `server_${serverTask.id}`;
                newTask.serverId = serverTask.id;
                
                currentTaskTexts.add(taskTextLower);
                newTasksCount++;
            }
        });
        
        if (newTasksCount > 0) {
            alert(`Загружено ${newTasksCount} новых задач`);
            saveAndRender();
        } else {
            alert('Новых задач не найдено');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки с сервера:', error);
        alert('Ошибка при загрузке задач с сервера');
    } finally {
        // Разблокируем кнопку
        loadFromServerBtn.disabled = false;
        loadFromServerBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Загрузить с сервера';
    }
});

/**
 * Обработка удаления выполненных задач
 */
clearCompletedBtn.addEventListener('click', async () => {
    if (!confirm('Удалить все выполненные задачи?')) return;
    
    const currentTasks = getTasks();
    const completedTasks = currentTasks.filter(t => t.completed);
    
    // Удаляем с сервера задачи, которые были загружены с сервера
    for (const task of completedTasks) {
        if (!isNaN(parseInt(task.id.replace('server_', '')))) {
            const serverId = parseInt(task.id.replace('server_', ''));
            try {
                await deleteTaskFromServer(serverId);
            } catch (error) {
                console.error(`Ошибка удаления задачи ${task.id} с сервера:`, error);
            }
        }
    }
    
    // Удаляем локально
    deleteCompletedTasks();
    saveAndRender();
});

// Устанавливаем активную кнопку фильтра
document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === currentFilter) {
        btn.classList.add('active');
    }
});

// Первоначальная отрисовка
renderTasks();

// Комментарий: Основной модуль приложения
// - Используется делегирование событий для обработки кликов на списке задач
// - Асинхронные операции с сервером через Fetch API
// - Модульная структура с импортом/экспортом
// - Сохранение состояния в LocalStorage и SessionStorage