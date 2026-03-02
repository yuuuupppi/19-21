// Константы для ключей хранилища
const STORAGE_KEYS = {
    TASKS: 'todo_app_tasks',
    FILTER: 'todo_app_filter'
};

/**
 * Загрузка задач из localStorage
 * @returns {Array} Массив задач
 */
export const loadTasks = () => {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
        console.error('Ошибка при загрузке из localStorage:', error);
        return [];
    }
};

/**
 * Сохранение задач в localStorage
 * @param {Array} tasks - Массив задач
 */
export const saveTasks = (tasks) => {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
    }
};

/**
 * Загрузка текущего фильтра из sessionStorage
 * @returns {string} Текущий фильтр ('all' по умолчанию)
 */
export const loadFilter = () => {
    try {
        return sessionStorage.getItem(STORAGE_KEYS.FILTER) || 'all';
    } catch (error) {
        console.error('Ошибка при загрузке фильтра:', error);
        return 'all';
    }
};

/**
 * Сохранение фильтра в sessionStorage
 * @param {string} filter - Выбранный фильтр
 */
export const saveFilter = (filter) => {
    try {
        sessionStorage.setItem(STORAGE_KEYS.FILTER, filter);
    } catch (error) {
        console.error('Ошибка при сохранении фильтра:', error);
    }
};