// ================================================================
// BELINDA PLATFORM — Управление пользователями
// Google Apps Script
// ================================================================
//
// КАК УСТАНОВИТЬ:
//
// 1. Откройте Google Таблицу (или создайте новую)
// 2. Расширения → Apps Script
// 3. Вставьте весь этот код (заменив пустой файл)
// 4. Нажмите ▶ Run → выберите функцию "setup" → запустите
//    (при первом запуске разрешите доступ к таблице)
// 5. Деплой → Новый деплой
//    • Тип: Веб-приложение
//    • Запускать как: Я (ваш Gmail)
//    • Доступ: Все (Anyone)
// 6. Скопируйте URL деплоя
// 7. Вставьте URL в файл .env.local:
//    APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
//
// ВАЖНО: после любых изменений в коде нужно создавать
//        НОВЫЙ деплой (не обновлять старый)
// ================================================================

var SHEET_NAME = 'Пользователи';

// ── Точки входа ──────────────────────────────────────────────────

function doGet(e) {
  try {
    var payload = JSON.parse(e.parameter.payload || '{}');
    return respond(handleAction(payload));
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAction(payload) {
  switch (payload.action) {
    case 'setup':      return setup();
    case 'getUsers':   return { success: true, data: readUsers() };
    case 'login':      return loginUser(payload.login, payload.password);
    case 'createUser': return createUser(payload.data);
    case 'updateUser': return updateUser(payload.id, payload.data);
    case 'deleteUser': return deleteUser(payload.id);
    default:           return { success: false, error: 'Неизвестное действие: ' + payload.action };
  }
}

// ── Первоначальная настройка ─────────────────────────────────────

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear();
  }

  // Заголовки
  var headers = [['ID', 'Логин', 'Пароль', 'Роль', 'Доступ к инструментам (JSON)', 'Создан']];
  var headerRange = sheet.getRange(1, 1, 1, 6);
  headerRange.setValues(headers);

  // Стили заголовков
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Ширина колонок
  sheet.setColumnWidth(1, 260); // ID
  sheet.setColumnWidth(2, 150); // Логин
  sheet.setColumnWidth(3, 150); // Пароль
  sheet.setColumnWidth(4, 130); // Роль
  sheet.setColumnWidth(5, 340); // Доступ
  sheet.setColumnWidth(6, 210); // Создан

  sheet.setFrozenRows(1);

  // Создать администратора по умолчанию
  var existing = readUsers();
  if (!existing.some(function(u) { return u.login === 'admin'; })) {
    sheet.appendRow([
      Utilities.getUuid(),
      'admin',
      'admin',
      'admin',
      'null',
      new Date().toISOString()
    ]);
    styleRow(sheet, 2);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Таблица создана! Войдите: admin / admin',
    '✅ Belinda Platform',
    6
  );

  return { success: true, message: 'Готово. Администратор: admin / admin' };
}

// ── CRUD операции ────────────────────────────────────────────────

function readUsers() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1)
    .filter(function(row) { return row[0] !== ''; })
    .map(rowToUser);
}

function loginUser(login, password) {
  var users = readUsers();
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].login === login && users[i].password === password) {
      user = users[i];
      break;
    }
  }
  return user
    ? { success: true, data: user }
    : { success: false, error: 'Неверный логин или пароль' };
}

function createUser(data) {
  var sheet = getSheet();
  var users = readUsers();

  if (users.some(function(u) { return u.login === data.login; })) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }

  var allowed = (data.allowedToolIds !== undefined) ? data.allowedToolIds : null;
  var row = [
    Utilities.getUuid(),
    data.login,
    data.password,
    data.role || 'user',
    JSON.stringify(allowed),
    new Date().toISOString()
  ];

  sheet.appendRow(row);
  styleRow(sheet, sheet.getLastRow());

  return { success: true, data: rowToUser(row) };
}

function updateUser(id, data) {
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      var row = i + 1;
      if (data.login !== undefined)       sheet.getRange(row, 2).setValue(data.login);
      if (data.password && data.password !== '') sheet.getRange(row, 3).setValue(data.password);
      if (data.role !== undefined)        sheet.getRange(row, 4).setValue(data.role);
      if ('allowedToolIds' in data)       sheet.getRange(row, 5).setValue(JSON.stringify(data.allowedToolIds));
      return { success: true };
    }
  }

  return { success: false, error: 'Пользователь не найден' };
}

function deleteUser(id) {
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { success: false, error: 'Пользователь не найден' };
}

// ── Вспомогательные функции ──────────────────────────────────────

function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Лист "' + SHEET_NAME + '" не найден. Запустите функцию setup()');
  return sheet;
}

function rowToUser(row) {
  var allowedToolIds = null;
  try {
    var parsed = JSON.parse(String(row[4]));
    allowedToolIds = (parsed === null || parsed === 'null') ? null : parsed;
  } catch (e) {
    allowedToolIds = null;
  }
  return {
    id:             String(row[0]),
    login:          String(row[1]),
    password:       String(row[2]),
    role:           String(row[3]),
    allowedToolIds: allowedToolIds,
    createdAt:      String(row[5])
  };
}

function styleRow(sheet, rowIndex) {
  var bg = (rowIndex % 2 === 0) ? '#f8fafc' : '#ffffff';
  sheet.getRange(rowIndex, 1, 1, 6).setBackground(bg);
}
