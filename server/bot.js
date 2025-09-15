const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://backend:3303/api/tasks';
const editingTasks = new Map();

function createBot(token) {
  const bot = new Telegraf(token);

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

  // /tasks
  bot.command('tasks', async (ctx) => {
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
  });

  // toggle
  bot.action(/toggle:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    const res = await axios.patch(`${API_URL}/${id}/toggle`);
    await ctx.reply(`Статус изменен: ${res.data.completed ? '✅ Выполнено' : '❌ Не выполнено'}`);
    await ctx.editMessageReplyMarkup();
  });

  // edit
  bot.action(/edit:(.+)/, async (ctx) => {
    const id = ctx.match[1];
    editingTasks.set(ctx.from.id, id);
    await ctx.reply('Отправьте новое название и описание через | (трубка), например:\nНовое название | Новое описание');
  });

  bot.on('text', async (ctx) => {
    if (!editingTasks.has(ctx.from.id)) return;

    const id = editingTasks.get(ctx.from.id);
    editingTasks.delete(ctx.from.id);

    const [title, description] = ctx.message.text.split('|').map(s => s.trim());
    if (!title || !description) return ctx.reply('Ошибка: нужно указать и название, и описание через |');

    await axios.put(`${API_URL}/${id}`, { title, description });
    await ctx.reply('Задача обновлена!');
  });

  return bot;
}

module.exports = { createBot, editingTasks };
