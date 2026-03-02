// Приватная переменная для хранения задач (инкапсуляция)
let tasks = [];

/**
 * Инициализация задач
 * @param {Array} initialTasks - Начальный массив задач
 */
export const initializeTasks = (initialTasks) => {
    tasks = [...initialTasks];
};

/**
 * Получение всех задач
 * @returns {Array} Массив всех задач
 */
export const getTasks = () => [...tasks];

/**
 * Получение задач по фильтру
 * @param {string} filter - Тип фильтра ('all', 'active', 'completed')
 * @returns {Array} Отфильтрованный массив задач
 */
export const getTasksByFilter = (filter) => {
    switch(filter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return [...tasks];
    }
};

/**
 * Добавление новой задачи
 * @param {string} text - Текст задачи
 * @param {string} priority - Приоритет ('low', 'medium', 'high')
 * @returns {Object} Созданная задача
 */
export const addTask = (text, priority = 'medium') => {
    const newTask = {
        id: Date.now().toString(), // уникальный ID на основе времени
        text: text.trim(),
        completed: false,
        priority: priority,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    return newTask;
};

/**
 * Обновление приоритета задачи
 * @param {string} id - ID задачи
 * @param {string} newPriority - Новый приоритет
 */
export const updateTaskPriority = (id, newPriority) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.priority = newPriority;
    }
};

/**
 * Переключение статуса выполнения задачи
 * @param {string} id - ID задачи
 */
export const toggleTaskStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
    }
};

/**
 * Удаление задачи по ID
 * @param {string} id - ID задачи
 */
export const deleteTask = (id) => {
    tasks = tasks.filter(task => task.id !== id);
};

/**
 * Удаление всех выполненных задач
 */
export const deleteCompletedTasks = () => {
    tasks = tasks.filter(task => !task.completed);
};

/**
 * Получение статистики задач
 * @returns {Object} Статистика (всего, выполнено)
 */
export const getStats = () => {
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length
    };
};