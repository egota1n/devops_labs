const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Task = require('../models/Task');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/taskmanager_test');
});

afterEach(async () => {
    await Task.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Task API', () => {
    it('should create a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Test task',
                description: 'Test description'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe('Test task');
    });
});