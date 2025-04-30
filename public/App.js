        // Firebase configuration
        const firebaseConfig = {
            // Replace with your actual Firebase config
            apiKey: "AIzaSyDnEkqlRPVxbHrm8vhm8mmOO1uQxb2WnAs",
            authDomain: "hackathon-a1623.firebaseapp.com",
            projectId: "hackathon-a1623",
            storageBucket: "hackathon-a1623.firebasestorage.app",
            messagingSenderId: "406863638433",
            appId: "1:406863638433:web:89b6da70fae39ce8cf25e0"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // DOM Elements - Auth
        const authContainer = document.getElementById('authContainer');
        const loginView = document.getElementById('loginView');
        const registerView = document.getElementById('registerView');
        const showRegisterBtn = document.getElementById('showRegister');
        const showLoginBtn = document.getElementById('showLogin');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginSpinner = document.getElementById('loginSpinner');
        const registerBtnText = document.getElementById('registerBtnText');
        const registerSpinner = document.getElementById('registerSpinner');

        // DOM Elements - App
        const taskApp = document.getElementById('taskApp');
        const logoutBtn = document.getElementById('logoutBtn');
        const userSection = document.getElementById('userSection');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const taskBoardBtn = document.getElementById('taskBoardBtn');
        const taskBoardView = document.getElementById('taskBoardView');
        const dashboardView = document.getElementById('dashboardView');
        
        // DOM Elements - Task Board
        const todayTaskCount = document.getElementById('todayTaskCount');
        const totalTaskCount = document.getElementById('totalTaskCount');
        const todoCount = document.getElementById('todoCount');
        const progressCount = document.getElementById('progressCount');
        const doneCount = document.getElementById('doneCount');
        const todoTasks = document.getElementById('todoTasks');
        const progressTasks = document.getElementById('progressTasks');
        const doneTasks = document.getElementById('doneTasks');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const quickTaskInput = document.getElementById('quickTaskInput');
        const quickAddTaskBtn = document.getElementById('quickAddTaskBtn');

        // DOM Elements - Dashboard
        const dashTotalTasks = document.getElementById('dashTotalTasks');
        const dashCompletedTasks = document.getElementById('dashCompletedTasks');
        const dashPendingTasks = document.getElementById('dashPendingTasks');
        const dashPendingTasksList = document.getElementById('dashPendingTasksList');
        const dashCompletedTasksList = document.getElementById('dashCompletedTasksList');
        const dashAddTaskBtn = document.getElementById('dashAddTaskBtn');

        // DOM Elements - Modal
        const taskModal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const taskForm = document.getElementById('taskForm');
        const taskId = document.getElementById('taskId');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskAssignee = document.getElementById('taskAssignee');
        const taskStatus = document.getElementById('taskStatus');
        const closeModal = document.getElementById('closeModal');
        const cancelTask = document.getElementById('cancelTask');
        const saveTaskBtn = document.getElementById('saveTaskBtn');

        // DOM Elements - Calendar
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');

        // Global variables
        let currentUser = null;
        let allUsers = [];
        let allTasks = [];
        
        // Authentication event listener
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                loadUserData();
                loadAllUsers();
                loadTasks();
                setupCalendar();
                authContainer.style.display = 'none';
                taskApp.style.display = 'flex';
            } else {
                currentUser = null;
                authContainer.style.display = 'flex';
                loginView.style.display = 'block';
                registerView.style.display = 'none';
                taskApp.style.display = 'none';
                // Clear forms
                loginForm.reset();
                registerForm.reset();
            }
        });

        // Authentication functions
        function loadUserData() {
            db.collection('users').doc(currentUser.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        userName.textContent = userData.name;
                        if (userData.name) {
                            const initials = userData.name.split(' ')
                                .map(name => name[0])
                                .join('')
                                .toUpperCase();
                            userAvatar.textContent = initials;
                        }
                    }
                })
                .catch(error => {
                    console.error("Error loading user data: ", error);
                });
        }

        function loadAllUsers() {
            db.collection('users').get()
                .then(snapshot => {
                    allUsers = [];
                    taskAssignee.innerHTML = '<option value="">Select User</option>';
                    snapshot.forEach(doc => {
                        const user = {
                            id: doc.id,
                            ...doc.data()
                        };
                        allUsers.push(user);
                        
                        // Add user to assignee dropdown
                        const option = document.createElement('option');
                        option.value = user.id;
                        option.textContent = user.name;
                        taskAssignee.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error("Error loading users: ", error);
                });
        }

        // Login and Register handlers
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = loginEmail.value;
            const password = loginPassword.value;
            
            loginBtnText.style.display = 'none';
            loginSpinner.style.display = 'inline-block';
            
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    console.error("Login error: ", error);
                    alert(`Login failed: ${error.message}`);
                    loginBtnText.style.display = 'inline-block';
                    loginSpinner.style.display = 'none';
                });
        });

        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = registerName.value;
            const email = registerEmail.value;
            const password = registerPassword.value;
            
            registerBtnText.style.display = 'none';
            registerSpinner.style.display = 'inline-block';
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Save user info to Firestore
                    return db.collection('users').doc(userCredential.user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .catch(error => {
                    console.error("Registration error: ", error);
                    alert(`Registration failed: ${error.message}`);
                    registerBtnText.style.display = 'inline-block';
                    registerSpinner.style.display = 'none';
                });
        });

        // Auth view toggle
        showRegisterBtn.addEventListener('click', () => {
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        });

        showLoginBtn.addEventListener('click', () => {
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        });

        // Logout handler
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });

        // View switching
        dashboardBtn.addEventListener('click', () => {
            taskBoardView.style.display = 'none';
            dashboardView.style.display = 'flex';
            dashboardBtn.classList.add('active');
            taskBoardBtn.classList.remove('active');
            updateDashboardStats();
        });

        taskBoardBtn.addEventListener('click', () => {
            dashboardView.style.display = 'none';
            taskBoardView.style.display = 'flex';
            taskBoardBtn.classList.add('active');
            dashboardBtn.classList.remove('active');
        });

        // Task CRUD operations
        function loadTasks() {
            db.collection('tasks')
                .orderBy('createdAt', 'desc')
                .get()
                .then(snapshot => {
                    allTasks = [];
                    todoTasks.innerHTML = '';
                    progressTasks.innerHTML = '';
                    doneTasks.innerHTML = '';
                    
                    snapshot.forEach(doc => {
                        const task = {
                            id: doc.id,
                            ...doc.data()
                        };
                        allTasks.push(task);
                    });
                    
                    renderTasks();
                    updateTaskCounts();
                    updateDashboardStats();
                })
                .catch(error => {
                    console.error("Error loading tasks: ", error);
                });
        }

        function renderTasks() {
            todoTasks.innerHTML = '';
            progressTasks.innerHTML = '';
            doneTasks.innerHTML = '';
            dashPendingTasksList.innerHTML = '';
            dashCompletedTasksList.innerHTML = '';
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let todayCount = 0;
            
            allTasks.forEach(task => {
                // Check if task was created today
                const taskDate = task.createdAt?.toDate() || new Date();
                taskDate.setHours(0, 0, 0, 0);
                if (taskDate.getTime() === today.getTime()) {
                    todayCount++;
                }
                
                // Create task card
                const taskCard = createTaskCard(task);
                
                // Add to appropriate column based on status
                if (task.status === 'todo') {
                    todoTasks.appendChild(taskCard);
                    dashPendingTasksList.appendChild(createTaskListItem(task));
                } else if (task.status === 'progress') {
                    progressTasks.appendChild(taskCard);
                    dashPendingTasksList.appendChild(createTaskListItem(task));
                } else if (task.status === 'done') {
                    doneTasks.appendChild(taskCard);
                    dashCompletedTasksList.appendChild(createTaskListItem(task));
                }
            });
            
            todayTaskCount.textContent = todayCount;
        }

        function createTaskCard(task) {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.setAttribute('data-id', task.id);
            
            const assignedUser = allUsers.find(user => user.id === task.assignee);
            const assigneeName = assignedUser ? assignedUser.name : 'Unassigned';
            const assigneeInitial = assigneeName[0] || 'U';
            
            taskCard.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <div class="assigned-user">
                        <div class="user-initial">${assigneeInitial}</div>
                        <span>${assigneeName}</span>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete-task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add action buttons based on status
            const actionRow = document.createElement('div');
            actionRow.className = 'task-actions-row';
            actionRow.style.marginTop = '10px';
            
            if (task.status === 'todo') {
                actionRow.innerHTML = `
                    <button class="btn btn-secondary btn-sm move-to-progress" style="font-size: 12px; padding: 5px 10px;">
                        Move to Progress
                    </button>
                `;
            } else if (task.status === 'progress') {
                actionRow.innerHTML = `
                    <button class="btn btn-secondary btn-sm move-to-done" style="font-size: 12px; padding: 5px 10px;">
                        Move to Done
                    </button>
                `;
            }
            
            taskCard.appendChild(actionRow);
            
            // Add event listeners
            taskCard.querySelector('.edit-task')?.addEventListener('click', () => editTask(task));
            taskCard.querySelector('.delete-task')?.addEventListener('click', () => deleteTask(task.id));
            taskCard.querySelector('.move-to-progress')?.addEventListener('click', () => moveTask(task.id, 'progress'));
            taskCard.querySelector('.move-to-done')?.addEventListener('click', () => moveTask(task.id, 'done'));
            
            return taskCard;
        }

        function createTaskListItem(task) {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.setAttribute('data-id', task.id);
            
            const assignedUser = allUsers.find(user => user.id === task.assignee);
            const assigneeName = assignedUser ? assignedUser.name : 'Unassigned';
            
            let statusClass = 'todo';
            if (task.status === 'progress') statusClass = 'progress';
            if (task.status === 'done') statusClass = 'done';
            
            let statusText = 'To Do';
            if (task.status === 'progress') statusText = 'In Progress';
            if (task.status === 'done') statusText = 'Done';
            
            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-name">${task.title}</div>
                    <div class="task-details">Assigned to: ${assigneeName}</div>
                </div>
                <div class="task-status ${statusClass}">${statusText}</div>
            `;
            
            return taskItem;
        }

        function updateTaskCounts() {
            const todoTaskCount = allTasks.filter(task => task.status === 'todo').length;
            const progressTaskCount = allTasks.filter(task => task.status === 'progress').length;
            const doneTaskCount = allTasks.filter(task => task.status === 'done').length;
            
            todoCount.textContent = todoTaskCount;
            progressCount.textContent = progressTaskCount;
            doneCount.textContent = doneTaskCount;
            totalTaskCount.textContent = allTasks.length;
        }

        function updateDashboardStats() {
            const totalCount = allTasks.length;
            const completedCount = allTasks.filter(task => task.status === 'done').length;
            const pendingCount = totalCount - completedCount;
            
            dashTotalTasks.textContent = totalCount;
            dashCompletedTasks.textContent = completedCount;
            dashPendingTasks.textContent = pendingCount;
        }

        // Task Modal functions
        function openTaskModal(isEdit = false, taskData = null) {
            if (isEdit && taskData) {
                modalTitle.textContent = 'Edit Task';
                taskId.value = taskData.id;
                taskTitle.value = taskData.title;
                taskDescription.value = taskData.description || '';
                taskAssignee.value = taskData.assignee || '';
                taskStatus.value = taskData.status;
            } else {
                modalTitle.textContent = 'Add New Task';
                taskForm.reset();
                taskId.value = '';
                taskStatus.value = 'todo';
            }
            
            taskModal.style.display = 'flex';
        }

        function closeTaskModal() {
            taskModal.style.display = 'none';
            taskForm.reset();
        }

        // Task actions
        function addTask(title, description = '', assignee = '', status = 'todo') {
            const newTask = {
                title,
                description,
                assignee,
                status,
                createdBy: currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            return db.collection('tasks').add(newTask)
                .then(() => {
                    loadTasks();
                    return true;
                })
                .catch(error => {
                    console.error("Error adding task: ", error);
                    return false;
                });
        }

        function editTask(task) {
            openTaskModal(true, task);
        }

        function updateTask(id, updatedData) {
            updatedData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            return db.collection('tasks').doc(id).update(updatedData)
                .then(() => {
                    loadTasks();
                    return true;
                })
                .catch(error => {
                    console.error("Error updating task: ", error);
                    return false;
                });
        }

        function deleteTask(id) {
            if (confirm('Are you sure you want to delete this task?')) {
                db.collection('tasks').doc(id).delete()
                    .then(() => {
                        loadTasks();
                    })
                    .catch(error => {
                        console.error("Error deleting task: ", error);
                    });
            }
        }

        function moveTask(id, newStatus) {
            updateTask(id, { status: newStatus });
        }

        // Calendar functions
        function setupCalendar() {
            const date = new Date();
            renderCalendar(date);
        }

        function renderCalendar(date) {
            calendarGrid.innerHTML = '';
            
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            
            currentMonth.textContent = monthNames[month];
            
            // Add day headers
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            dayNames.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day header';
                dayEl.textContent = day;
                calendarGrid.appendChild(dayEl);
            });
            
            // Get the first day of the month
            const firstDay = new Date(year, month, 1).getDay();
            
            // Get the number of days in the month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Add empty cells for days before first of month
            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day';
                calendarGrid.appendChild(emptyDay);
            }
            
            // Add days of the month
            const today = new Date();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = i;
                
                // Highlight today
                if (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year) {
                    dayEl.classList.add('today');
                }
                
                // Check if there are tasks for this day
                const taskDate = new Date(year, month, i);
                const hasTaskOnDay = allTasks.some(task => {
                    if (!task.createdAt) return false;
                    const tDate = task.createdAt.toDate();
                    return tDate.getDate() === i && 
                           tDate.getMonth() === month && 
                           tDate.getFullYear() === year;
                });
                
                if (hasTaskOnDay) {
                    dayEl.classList.add('has-task');
                }
                
                calendarGrid.appendChild(dayEl);
            }
        }

        // Event Listeners
        addTaskBtn.addEventListener('click', () => openTaskModal());
        dashAddTaskBtn.addEventListener('click', () => openTaskModal());
        closeModal.addEventListener('click', closeTaskModal);
        cancelTask.addEventListener('click', closeTaskModal);

        quickAddTaskBtn.addEventListener('click', () => {
            const title = quickTaskInput.value.trim();
            if (title) {
                addTask(title).then(success => {
                    if (success) {
                        quickTaskInput.value = '';
                    }
                });
            }
        });

        taskForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const id = taskId.value;
            const title = taskTitle.value;
            const description = taskDescription.value;
            const assignee = taskAssignee.value;
            const status = taskStatus.value;
            
            if (!title) return;
            
            if (id) {
                // Update existing task
                updateTask(id, {
                    title,
                    description,
                    assignee,
                    status
                }).then(success => {
                    if (success) {
                        closeTaskModal();
                    }
                });
            } else {
                // Add new task
                addTask(title, description, assignee, status).then(success => {
                    if (success) {
                        closeTaskModal();
                    }
                });
            }
        });

        // Initial state - hide app until auth check is complete
        taskApp.style.display = 'none';