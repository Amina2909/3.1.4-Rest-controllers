// Инициализация CSRF-токена и заголовка
let csrfToken;
let csrfHeader;

// Получение CSRF-токена
fetch('/api/user/csrf-token')
    .then(response => response.text())
    .then(token => {
        // Устанавливаем значение токена в скрытое поле
        document.getElementById('csrfToken').value = token;

        // Инициализируем переменные
        csrfToken = token;
        csrfHeader = 'X-XSRF-TOKEN'; // Или 'X-XSRF-TOKEN', в зависимости от вашей конфигурации

        console.log('XSRF-токен получен:', csrfToken);

        // Запускаем загрузку данных после получения токена
        $(document).ready(function () {
            fetchUserData();
            fetchUsers();
            loadRoles();

            // Активируем вкладки
            $('#admin-sub-tab a').on('click', function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

            // Активируем первую вкладку по умолчанию
            $('#users-tab').tab('show');


            // Обработчик для вкладки Admin
            $('#admin-tab').on('click', function (e) {
                e.preventDefault();
                console.log('Вкладка Admin нажата'); // Отладочный вывод

                // Активируем вкладку Admin
                $('#admin-tab').tab('show');

                // Загружаем данные администратора (если нужно)
                fetchUsers(); // Например, обновляем список пользователей
            });

            // Обработчик для вкладки User
            $('#user-tab').on('click', function (e) {
                e.preventDefault();
                console.log('Вкладка User нажата'); // Отладочный вывод
                // активируем вкладку User
                $('#user-tab').tab('show');
                fetchUserData(); // Загружаем данные пользователя
            });
        });
    })
    .catch(error => console.error('Ошибка при получении CSRF-токена:', error));
// Проверка роли пользователя и скрытие вкладки Admin
fetch('/api/user')
    .then(response => response.json())
    .then(user => {
        const roles = user.roles.map(role => role.name);
        if (roles.includes('ROLE_USER') && !roles.includes('ROLE_ADMIN')) {
            // Скрываем вкладку Admin
            $('#admin-tab').hide();
            // Активируем вкладку User
            $('#user-tab').tab('show');
            fetchUserData(); // Загружаем данные пользователя
        }
    })
    .catch(error => console.error('Error:', error));

let users = [];

// Функция загрузки пользователей
function fetchUsers() {
    fetch('/api/admin/users', {
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Users data:', data); // Логируем данные
            users = data;
            renderUsersTable();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorModal('Failed to load users');
        });
}

// Функция загрузки данных текущего пользователя
function fetchUserData() {
    fetch('/api/user', {
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('User data:', data); // Логируем данные
            console.log('User roles:', data.roles); // Логируем роли
            //Обновляем навбар
            updateNavbar(data);
            renderUserData(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorModal('Failed to load user data');
        });
}

// Функция обновления навбара
function updateNavbar(user) {
    if (user && user.email) {
        // Обновляем email пользователя
        document.getElementById('currentUserEmail').textContent = user.email;
    }
    if (user && user.roles) {
        // Обновляем роли пользователя
        const roles = user.roles.map(role => role.name.replace('ROLE_', '')).join(', ');
        document.getElementById('currentUserRoles').textContent = roles;
    }
}

// Функция отображения данных текущего пользователя
function renderUserData(user) {
    console.log('Данные пользователя:', user); // Отладочный вывод
    if (!user) {
        console.error('Данные пользователя отсутствуют');
        return;
    }
    const userContent = `
        <h1 class="ms-3 mb-5">User information-page</h1>
        <table class="table table-striped bordered-table">
            <caption>About user</caption>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.roles.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
                </tr>
            </tbody>
        </table>
    `;
    $('#user-content').html(userContent); // Отображаем данные в блоке #user-content
}

// Функция загрузки ролей
function loadRoles() {
    fetch('/api/admin/roles', {
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => response.json())
        .then(roles => {
            const select = $('#role');
            roles.forEach(role => {
                select.append(new Option(role.name.replace('ROLE_', ''), role.id));
            });
        });
}

// Рендер таблицы пользователей
function renderUsersTable() {
    const tbody = $('table tbody').empty();
    users.forEach(user => {
        const roles = user.roles.map(role => role.name.replace('ROLE_', '')).join(' ');
        const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roles}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-sm"
                                data-bs-toggle="modal" data-bs-target="#editModal"
                                data-user-id="${user.id}" onclick="loadUserForEdit(${user.id})">
                            Edit
                        </button>
                    </td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#deleteModal"
                                data-user-id="${user.id}" onclick="loadUserForDelete(${user.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        tbody.append(row);
    });
}

// Обработчик формы создания пользователя
$(document).ready(function () {
$('#createUserForm').submit(function (e) {
    e.preventDefault();
    console.log('Форма создания пользователя отправлена'); // Отладочный вывод
    const formData = {
        name: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        roleIds: Array.from($('#role').val()).map(Number)
    };
    console.log('Данные для создания пользователя:', formData); // Отладочный вывод

    fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (response.ok) {
                console.log('Пользователь успешно создан'); // Отладочный вывод
                $('#createUserForm')[0].reset();
                fetchUsers();
                $('#users-tab').tab('show');
            }else {
                console.error('Ошибка:', response.status, response.statusText); // Отладочный вывод
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => console.error('Error:', error));
});
});

// Загрузка данных для редактирования
function loadUserForEdit(userId) {
    fetch(`/api/admin/users/${userId}`, {
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => response.json())
        .then(user => {
            console.log('Данные пользователя для редактирования:', user); // Отладочный вывод
            $('#editId').val(user.id);
            $('#editName').val(user.name);
            $('#editEmail').val(user.email);

            // Загрузите все роли
            fetch('/api/admin/roles', {
                headers: {
                    [csrfHeader]: csrfToken
                }
            })
                .then(response => response.json())
                .then(roles => {
                    const rolesSelect = $('#editRoles').empty();
                    roles.forEach(role => {
                        // Проверьте, есть ли роль у пользователя
                        const isSelected = user.roles.some(userRole => userRole.id === role.id);
                        rolesSelect.append(new Option(
                            role.name.replace('ROLE_', ''),
                            role.id,
                            false,
                            isSelected
                        ));
                    });
                })
                .catch(error => console.error('Ошибка при загрузке ролей:', error));
        })
        .catch(error => console.error('Ошибка при загрузке данных пользователя:', error));
}

// Обработчик формы редактирования
$(document).ready(function () {
    $('#editForm').submit(function (e) {
        e.preventDefault();
        console.log('Форма редактирования отправлена'); // Отладочный вывод

        const userId = $('#editId').val();
        const formData = {
            name: $('#editName').val(),
            email: $('#editEmail').val(),
            password: $('#editPassword').val(),
            roleIds: Array.from($('#editRoles').val()).map(Number)
        };
        if (!formData.password) {
            delete formData.password;
        }
        console.log('Данные для обновления:', formData); // Отладочный вывод

        fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.ok) {
                    console.log('Пользователь успешно обновлен'); // Отладочный вывод
                    $('#editModal').modal('hide');
                    fetchUsers();
                    $('#editForm')[0].reset(); // Сбрасываем форму
                    $('#editRoles').empty();   // Очищаем выпадающий список ролей
                } else {
                    console.error('Ошибка:', response.status, response.statusText); // Отладочный вывод
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            })
            .catch(error => console.error('Error:', error));
    });
});

// Загрузка данных для удаления
function loadUserForDelete(userId) {
    fetch(`/api/admin/users/${userId}`, {
        headers: {
            [csrfHeader]: csrfToken
        }
    })
        .then(response => response.json())
        .then(user => {
            $('#deleteId').val(user.id);
        });
}

// Обработчик формы удаления
$(document).ready(function () {
    console.log('DOM загружен'); // Проверка, что DOM загружен
$('#deleteForm').submit(function (e) {
    e.preventDefault();
    console.log('Форма удаления отправлена'); // Отладочный вывод

    const userId = $('#deleteId').val();

    fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        }
    })
        .then(response => {
            if (response.ok) {
                console.log('Пользователь успешно удален'); // Отладочный вывод

                $('#deleteModal').modal('hide');
                fetchUsers();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => console.error('Error:', error));
});
});