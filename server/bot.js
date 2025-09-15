const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// eslint-disable-next-line sonarjs/no-insecure-url
process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3303/api/tasks';
// eslint-disable-next-line sonarjs/no-insecure-url
const API_URL = process.env.BACKEND_URL || 'http://backend:3303/api/tasks';

const editingTasks = new Map();

function createBot(token) {
  const bot = new Telegraf(token);

  // Функция для вывода задач
  const showTasks = async (ctx) => {
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
            Markup.button.callback('Редактировать', `edit:${task._id}`)
          ])
        );
      }
    } catch (err) {
      console.error(err);
      await ctx.reply('Ошибка при получении задач');
    }
  };

  // Главная кнопка /start
  bot.start((ctx) => {
    return ctx.reply(
      'Выберите действие:',
      Markup.inlineKeyboard([
        Markup.button.callback('Показать задачи', 'show_tasks'),
        Markup.button.callback('Добавить задачу', 'add_task')
      ])
    );
  });

  // Показать задачи через кнопку
  bot.action('show_tasks', showTasks);

  // Добавить новую задачу через кнопку
  bot.action('add_task', async (ctx) => {
    editingTasks.set(ctx.from.id, 'new'); // метка для новой задачи
    await ctx.reply('Отправьте новое название и описание через | (трубка), например:\nНовое название | Новое описание');
  });

  // /tasks — просто текстовая команда для списка задач
  bot.command('tasks', showTasks);

  // Toggle задачи
  bot.action(/toggle:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    try {
      const res = await axios.patch(`${API_URL}/${id}/toggle`);
      await ctx.reply(`Статус изменен: ${res.data.completed ? '✅ Выполнено' : '❌ Не выполнено'}`);
      await ctx.editMessageReplyMarkup();
      await showTasks(ctx); // показываем актуальный список задач
    } catch (err) {
      console.error(err);
      await ctx.reply('Ошибка при изменении статуса задачи');
    }
  });

  // Редактирование задачи
  bot.action(/edit:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    editingTasks.set(ctx.from.id, id);
    await ctx.reply('Отправьте новое название и описание через | (трубка), например:\nНовое название | Новое описание');
  });

  // Обработка текста для добавления или редактирования
  bot.on('text', async (ctx) => {
    if (!editingTasks.has(ctx.from.id)) return;

    const id = editingTasks.get(ctx.from.id);
    editingTasks.delete(ctx.from.id);

    const [title, description] = ctx.message.text.split('|').map(s => s.trim());
    if (!title || !description) return ctx.reply('Ошибка: нужно указать и название, и описание через |');

    try {
      if (id === 'new') {
        const res = await axios.post(API_URL, { title, description });
        await ctx.reply(`Задача создана: ${res.data.title}`);
      } else {
        await axios.put(`${API_URL}/${id}`, { title, description });
        await ctx.reply('Задача обновлена!');
      }
      await showTasks(ctx); // показываем актуальный список задач
    } catch (err) {
      console.error(err);
      await ctx.reply('Произошла ошибка при сохранении задачи');
    }
  });

  return bot;
}

module.exports = { createBot, editingTasks };