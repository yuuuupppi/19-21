// Базовый URL API JSONPlaceholder
const API_URL = 'https://jsonplaceholder.typicode.com/todos';

/**
 * Получение задач с сервера (GET-запрос)
 * @returns {Promise<Array>} Массив задач
 */
export async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}?_limit=10`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке задач с сервера:', error);
        throw error;
    }
}

/**
 * Создание новой задачи на сервере (POST-запрос)
 * @param {Object} task - Объект задачи
 * @returns {Promise<Object>} Созданная задача
 */
export async function createTaskOnServer(task) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: task.text,
                completed: task.completed,
                userId: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при создании задачи на сервере:', error);
        throw error;
    }
}

/**
 * Обновление задачи на сервере (PATCH-запрос)
 * @param {number} id - ID задачи
 * @param {Object} updates - Обновляемые поля
 * @returns {Promise<Object>} Обновленная задача
 */
export async function updateTaskOnServer(id, updates) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Ошибка при обновлении задачи ${id}:`, error);
        throw error;
    }
}

/**
 * Удаление задачи с сервера (DELETE-запрос)
 * @param {number} id - ID задачи
 * @returns {Promise<boolean>} true - если удаление успешно
 */
export async function deleteTaskFromServer(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error(`Ошибка при удалении задачи ${id}:`, error);
        throw error;
    }
}