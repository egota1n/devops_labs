import { render, fireEvent, waitFor } from '@testing-library/vue'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import axios from 'axios'
import { Table, message } from 'ant-design-vue'
import { createRouter, createWebHistory } from 'vue-router'
import { expect, vi } from 'vitest'

vi.mock('axios')
vi.mock('ant-design-vue', () => ({
    message: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

global.window.matchMedia = global.window.matchMedia || function() {
    return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
    }
}

if (!window.getComputedStyle) {
    window.getComputedStyle = () => ({
        getPropertyValue: () => '',
    })
}

const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: HomeView }],
})

describe('Task Manager App', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({
            data: [
                { _id: '1', title: 'Task 1', description: 'Desc 1', completed: false },
                { _id: '2', title: 'Task 2', description: 'Desc 2', completed: true },
            ],
        })
    })

    it('renders task manager title', async () => {
        const { findByText } = render(App, {
            global: { plugins: [router] },
        })
        await router.isReady()

        expect(await findByText('Task Manager')).toBeTruthy()
    })

    it('displays a list of tasks', async () => {
        const { findByText } = render(App, { global: { plugins: [router] } })
        await router.isReady()

        expect(await findByText('Task 1')).toBeTruthy()
        expect(await findByText('Task 2')).toBeTruthy()
    })

    it('allows adding a new task', async () => {
        axios.post.mockResolvedValue({
            data: { _id: '3', title: 'New Task', description: 'New Desc', completed: false },
        })

        const { getByPlaceholderText, getByText } = render(App, {
            global: { plugins: [router] },
        })
        await router.isReady()

        await fireEvent.update(getByPlaceholderText('Task title'), 'New Task')
        await fireEvent.update(getByPlaceholderText('Task description'), 'New Desc')
        await fireEvent.click(getByText('Add Task'))

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/tasks', {
                title: 'New Task',
                description: 'New Desc',
                completed: false,
            })
            expect(message.success).toHaveBeenCalledWith('Task added successfully')
        })
    })

    it('allows editing a task', async () => {
        axios.put.mockResolvedValue({
            data: { _id: '1', title: 'Updated Task', description: 'Updated Desc', completed: false },
        })

        const { findAllByText, getByPlaceholderText, getByText } = render(App, {
            global: { plugins: [router] },
        })
        await router.isReady()

        const editButtons = await findAllByText('Edit')
        await fireEvent.click(editButtons[0])

        await fireEvent.update(getByPlaceholderText('Task title'), 'Updated Task')
        await fireEvent.update(getByPlaceholderText('Task description'), 'Updated Desc')
        await fireEvent.click(getByText('Update Task'))

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/tasks/1', {
                title: 'Updated Task',
                description: 'Updated Desc',
                completed: false,
            })
            expect(message.success).toHaveBeenCalledWith('Task updated successfully')
        })
    })

    it('allows deleting a task', async () => {
        axios.delete.mockResolvedValue({})

        const { findAllByText } = render(App, { global: { plugins: [router] } })
        await router.isReady()

        const deleteButtons = await findAllByText('Delete')
        await fireEvent.click(deleteButtons[0])

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('/api/tasks/1')
            expect(message.success).toHaveBeenCalledWith('Task deleted')
        })
    })
})