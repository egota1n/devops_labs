const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const API_URL = 'http://localhost:3303/api/tasks';

const editingTasks = new Map();
const addingTasks = new Set();

// Функция для отображения всех задач
async function showTasks(ctx) {
  try {
    const res = await axios.get(API_URL);
    const tasks = res.data;

    if (!tasks.length) return ctx.reply('Нет задач 😅');

    for (const task of tasks) {
      const text = `Название: ${task.title}\nОписание: ${task.description}\nСтатус: ${task.completed ? '✅ Выполнено' : '❌ Не выполнено'}`;

      await ctx.reply(
        text,
        Markup.inlineKeyboard([
          Markup.button.callback(
            task.completed ? 'Сделать невыполненной' : 'Выполнить',
            `toggle:${task._id}`
          ),
          Markup.button.callback('Редактировать', `edit:${task._id}`),
          Markup.button.callback('Удалить', `delete:${task._id}`)
        ])
      );
    }
  } catch (err) {
    console.error(err);
    ctx.reply('Ошибка при получении задач');
  }
}

// Главная кнопка /start
bot.start((ctx) => {
  return ctx.reply(
    'Выберите действие:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Показать задачи', 'show')],
      [Markup.button.callback('Добавить задачу', 'add')]
    ])
  );
});

// Кнопка "Показать задачи"
bot.action('show', async (ctx) => {
  await showTasks(ctx);
  await ctx.editMessageReplyMarkup(); // убрать клавиатуру
});

// Кнопка "Добавить задачу"
bot.action('add', async (ctx) => {
  addingTasks.add(ctx.from.id);
  await ctx.reply('Отправьте название и описание через |, например:\nНовая задача | Описание задачи');
  await ctx.editMessageReplyMarkup();
});

// Обработчик текста
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;

  // Добавление новой задачи
  if (addingTasks.has(userId)) {
    addingTasks.delete(userId);

    const [title, description] = ctx.message.text.split('|').map(s => s.trim());
    if (!title || !description) return ctx.reply('Ошибка: нужно указать и название, и описание через |');

    try {
      await axios.post(API_URL, { title, description });
      ctx.reply('Задача добавлена! ✅');
      await showTasks(ctx);
      return;
    } catch (err) {
      console.error(err);
      return ctx.reply('Ошибка при добавлении задачи');
    }
  }

  // Редактирование существующей задачи
  if (editingTasks.has(userId)) {
    const id = editingTasks.get(userId);
    editingTasks.delete(userId);

    const [title, description] = ctx.message.text.split('|').map(s => s.trim());
    if (!title || !description) return ctx.reply('Ошибка: нужно указать и название, и описание через |');

    try {
      await axios.put(`${API_URL}/${id}`, { title, description });
      ctx.reply('Задача обновлена! ✅');
      await showTasks(ctx);
    } catch (err) {
      console.error(err);
      ctx.reply('Ошибка при обновлении задачи');
    }
  }
});

// Кнопка "toggle"
bot.action(/toggle:(.+)/, async (ctx) => {
  const id = ctx.match[1];
  try {
    await axios.patch(`${API_URL}/${id}/toggle`);
    await ctx.reply('Статус задачи изменен!');
    await showTasks(ctx);
    await ctx.editMessageReplyMarkup();
  } catch (err) {
    console.error(err);
    ctx.reply('Ошибка при изменении статуса');
  }
});

// Кнопка "edit"
bot.action(/edit:(.+)/, async (ctx) => {
  const id = ctx.match[1];
  editingTasks.set(ctx.from.id, id);

  await ctx.reply('Отправьте новое название и описание через | (трубка), например:\nНовое название | Новое описание');
});

// Кнопка "delete"
bot.action(/delete:(.+)/, async (ctx) => {
  const id = ctx.match[1];
  try {
    await axios.delete(`${API_URL}/${id}`);
    await ctx.reply('Задача удалена! ✅');
    await showTasks(ctx);
    await ctx.editMessageReplyMarkup();
  } catch (err) {
    console.error(err);
    ctx.reply('Ошибка при удалении задачи');
  }
});

bot.launch().then(() => console.log('Bot started'));
