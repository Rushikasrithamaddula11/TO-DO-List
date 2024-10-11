document.addEventListener('DOMContentLoaded', function () {
  const taskInput = document.getElementById('task-input');
  const dueDateInput = document.getElementById('due-date-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');

  // Function to create a task element
  function createTaskElement(task, taskId, isCompleted) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    if (isCompleted) li.classList.add('completed');
    li.innerHTML = `${task.task} - Due: ${task.due_date} 
      <button class="complete-btn" data-id="${taskId}">Complete</button>
      <button class="delete-btn" data-id="${taskId}">Delete</button>`;
    return li;
  }

  // Add Task
  addTaskBtn.addEventListener('click', async function () {
    const task = taskInput.value;
    const dueDate = dueDateInput.value;

    if (!task || !dueDate) {
      alert('Please enter a task and a due date');
      return;
    }

    try {
      // Send request to the backend to add the task
      const response = await fetch('/add_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: task, due_date: dueDate }),
      });

      const data = await response.json();
      if (response.ok) {
        const taskElement = createTaskElement({ task, due_date: dueDate }, data.taskId, false); // Use the real taskId from the backend
        taskList.appendChild(taskElement);
        taskInput.value = '';
        dueDateInput.value = '';
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('An error occurred while adding the task.');
    }
  });

  // Mark Task as Completed
  taskList.addEventListener('click', async function (event) {
    if (event.target.classList.contains('complete-btn')) {
      const taskId = event.target.getAttribute('data-id');

      try {
        // Send request to the backend to mark the task as completed
        const response = await fetch(`/complete_task/${taskId}`, {
          method: 'POST',
        });

        const data = await response.json();
        if (response.ok) {
          event.target.parentElement.classList.add('completed');
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error completing task:', error);
        alert('An error occurred while completing the task.');
      }
    }
  });

  // Delete Task
  taskList.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-btn')) {
      const taskId = event.target.getAttribute('data-id');

      try {
        // Send request to the backend to delete the task
        const response = await fetch(`/delete_task/${taskId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          event.target.parentElement.remove();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('An error occurred while deleting the task.');
      }
    }
  });

  // Task Filtering
  document.getElementById('filter-all').addEventListener('click', function () {
    Array.from(taskList.children).forEach(function (taskItem) {
      taskItem.style.display = 'block';
    });
  });

  document.getElementById('filter-pending').addEventListener('click', function () {
    Array.from(taskList.children).forEach(function (taskItem) {
      if (taskItem.classList.contains('completed')) {
        taskItem.style.display = 'none';
      } else {
        taskItem.style.display = 'block';
      }
    });
  });

  document.getElementById('filter-completed').addEventListener('click', function () {
    Array.from(taskList.children).forEach(function (taskItem) {
      if (!taskItem.classList.contains('completed')) {
        taskItem.style.display = 'none';
      } else {
        taskItem.style.display = 'block';
      }
    });
  });
});
