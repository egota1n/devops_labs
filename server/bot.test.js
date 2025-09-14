const { createBot } = require('./bot');
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
    const mockTasks = [
      { _id: '1', title: 'Test', description: 'Desc', completed: false },
    ];
    axios.get.mockResolvedValue({ data: mockTasks });

    const commandHandler = bot.command.mock.calls.find(c => c[0] === 'tasks')[1];
    await commandHandler(ctx);

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3303/api/tasks');
    expect(mockReply).toHaveBeenCalled();
  });

  it('обрабатывает toggle action', async () => {
    axios.patch.mockResolvedValue({ data: { completed: true } });
    const actionHandler = bot.action.mock.calls.find(c => c[0].toString().includes('toggle'))[1];
    ctx.match = ['toggle:1', '1'];
    await actionHandler(ctx);

    expect(axios.patch).toHaveBeenCalledWith('http://localhost:3303/api/tasks/1/toggle');
    expect(mockReply).toHaveBeenCalledWith('Статус изменен: ✅ Выполнено');
  });

  it('обрабатывает edit action и текст для редактирования', async () => {
    const actionHandler = bot.action.mock.calls.find(c => c[0].toString().includes('edit'))[1];
    ctx.match = ['edit:1', '1'];
    await actionHandler(ctx);

    expect(mockReply).toHaveBeenCalledWith(expect.stringContaining('Отправьте новое название и описание'));
  });

  it('обрабатывает редактирование текста', async () => {
    const { editingTasks } = require('./bot');
    editingTasks.set(1, '1');
    axios.put.mockResolvedValue({});

    await bot.on.mock.calls.find(c => c[0] === 'text')[1](ctx);

    expect(axios.put).toHaveBeenCalledWith('http://localhost:3303/api/tasks/1', { title: 'Test', description: 'Description' });
    expect(mockReply).toHaveBeenCalledWith('Задача обновлена!');
  });
});
