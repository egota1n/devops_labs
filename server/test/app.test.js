const request = require('supertest');
const { app, connectDB } = require('../app');
const mongoose = require('mongoose');
const Task = require('../models/Task');

beforeAll(async () => {
    await connectDB();
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

    it('should get all tasks', async () => {
        await Task.create({ title: 'Sample Task' });

        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get task by id', async () => {
        const task = await Task.create({ title: 'Task to fetch' });

        const res = await request(app).get(`/api/tasks/${task._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Task to fetch');
    });

    it('should return 404 when task not found', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/tasks/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    it('should update task', async () => {
        const task = await Task.create({ title: 'Old title' });

        const res = await request(app)
            .put(`/api/tasks/${task._id}`)
            .send({ title: 'Updated title' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated title');
    });

    it('should delete task', async () => {
        const task = await Task.create({ title: 'Task to delete' });

        const res = await request(app).delete(`/api/tasks/${task._id}`);
        expect(res.statusCode).toBe(200);

        const check = await Task.findById(task._id);
        expect(check).toBeNull();
    });

    it('should toggle completed status', async () => {
        const task = await Task.create({ title: 'Task to toggle', completed: false });

        const res = await request(app).patch(`/api/tasks/${task._id}/toggle`);
        expect(res.statusCode).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    it('should return 400 when creating invalid task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({}); // no title

        expect(res.statusCode).toBe(400);
    });

    it('should return 404 when updating non-existent task', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/tasks/${fakeId}`)
            .send({ title: 'Does not exist' });

        expect(res.statusCode).toBe(404);
    });
});