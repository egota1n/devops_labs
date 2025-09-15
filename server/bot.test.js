const { createBot, editingTasks } = require('./bot');
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

jest.mock('telegraf');
jest.mock('axios');

describe('Telegram Bot', () => {
  let bot;

  const mockReply = jest.fn();
  const mockEditReply = jest.fn();
  const ctx = {
    reply: mockReply,
    editMessageReplyMarkup: mockEditReply,
    from: { id: 1 },
    message: { text: 'Test | Description' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    editingTasks.clear();

    const botMock = {
      start: jest.fn(),
      command: jest.fn(),
      action: jest.fn(),
      on: jest.fn(),
      launch: jest.fn().mockResolvedValue(),
    };
    Telegraf.mockImplementation(() => botMock);
    bot = createBot('TEST_TOKEN');
  });

  it('должен создавать экземпляр Telegraf с токеном', () => {
    expect(Telegraf).toHaveBeenCalledWith('TEST_TOKEN');
  });

  it('должен зарегистрировать команды и кнопки', () => {
    expect(bot.start).toBeDefined();
    expect(bot.command).toBeDefined();
    expect(bot.action).toBeDefined();
    expect(bot.on).toBeDefined();
  });

  it('должен запускать бота', async () => {
    await bot.launch();
    expect(bot.launch).toHaveBeenCalled();
  });

  it('обрабатывает /tasks и выводит задачи', async () => {
    const mockTasks = [{ _id: '1', title: 'Test', description: 'Desc', completed: false }];
    axios.get.mockResolvedValue({ data: mockTasks });

    const commandHandler = bot.command.mock.calls.find(c => c[0] === 'tasks')[1];
    await commandHandler(ctx);

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3303/api/tasks');
    expect(mockReply).toHaveBeenCalled();
  });

  it('обрабатывает toggle action', async () => {
    axios.patch.mockResolvedValue({ data: { completed: true } });
    axios.get.mockResolvedValue({ data: [{ _id: '1', title: 'Test', description: 'Desc', completed: true }] });

    const actionHandler = bot.action.mock.calls.find(c => c[0].toString().includes('toggle'))[1];
    ctx.match = ['toggle:1', '1'];
    await actionHandler(ctx);

    expect(axios.patch).toHaveBeenCalledWith('http://localhost:3303/api/tasks/1/toggle');
    const replies = mockReply.mock.calls.map(c => c[0]);
    expect(replies).toContain('Статус изменен: ✅ Выполнено');
    expect(replies.some(r => r.includes('Название: Test'))).toBe(true);
  });

  it('обрабатывает edit action и текст для редактирования', async () => {
    const actionHandler = bot.action.mock.calls.find(c => c[0].toString().includes('edit'))[1];
    ctx.match = ['edit:1', '1'];
    await actionHandler(ctx);

    expect(mockReply).toHaveBeenCalledWith(expect.stringContaining('Отправьте новое название и описание'));
  });

  it('обрабатывает редактирование текста', async () => {
    editingTasks.set(ctx.from.id, '1');
    axios.put.mockResolvedValue({});
    axios.get.mockResolvedValue({ data: [{ _id: '1', title: 'Test', description: 'Description', completed: false }] });

    const textHandler = bot.on.mock.calls.find(c => c[0] === 'text')[1];
    await textHandler(ctx);

    expect(axios.put).toHaveBeenCalledWith('http://localhost:3303/api/tasks/1', { title: 'Test', description: 'Description' });
    const replies = mockReply.mock.calls.map(c => c[0]);
    expect(replies).toContain('Задача обновлена!');
    expect(replies.some(r => r.includes('Название: Test'))).toBe(true);
  });

  it('обрабатывает добавление новой задачи через кнопку', async () => {
    const addTaskHandler = bot.action.mock.calls.find(c => c[0] === 'add_task')[1];
    await addTaskHandler(ctx);

    expect(editingTasks.get(ctx.from.id)).toBe('new');
    expect(mockReply).toHaveBeenCalledWith(expect.stringContaining('Отправьте новое название и описание'));
  });

  it('обрабатывает добавление новой задачи через текст', async () => {
    editingTasks.set(ctx.from.id, 'new');
    const newTask = { data: { _id: '2', title: 'New Task', description: 'Description', completed: false } };
    axios.post.mockResolvedValue(newTask);
    axios.get.mockResolvedValue({ data: [newTask.data] });

    const textHandler = bot.on.mock.calls.find(c => c[0] === 'text')[1];
    await textHandler(ctx);

    expect(axios.post).toHaveBeenCalledWith('http://localhost:3303/api/tasks', { title: 'Test', description: 'Description' });
    const replies = mockReply.mock.calls.map(c => c[0]);
    expect(replies).toContain('Задача создана: New Task');
    expect(replies.some(r => r.includes('Название: New Task'))).toBe(true);
  });
});