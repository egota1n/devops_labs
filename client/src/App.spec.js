import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'
import { expect, vi } from 'vitest'

vi.mock('axios')

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

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('renders task manager title', async () => {
        render(App, {
            global: {
                plugins: [router],
            },
        })

        await router.isReady()
        expect(await screen.findByText('Task Manager')).toBeTruthy()
    })

    it('displays a list of tasks', async () => {
        render(App, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        expect(await screen.findByText('Task 1')).toBeTruthy()
        expect(await screen.findByText('Task 2')).toBeTruthy()
    })

    it('allows adding a new task', async () => {
        const newTask = {
            _id: '3',
            title: 'New Task',
            description: 'New Desc',
            completed: false
        }
        axios.post.mockResolvedValue({ data: newTask })

        render(App, {
            global: {
                plugins: [router],
            },
        })
        await router.isReady()

        const titleInput = screen.getByPlaceholderText('Task title')
        const descInput = screen.getByPlaceholderText('Task description')
        const submitButton = screen.getByText('Add Task')

        await fireEvent.update(titleInput, 'New Task')
        await fireEvent.update(descInput, 'New Desc')
        await fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/tasks', {
                title: 'New Task',
                description: 'New Desc',
                completed: false,
            })
        })
    })

    it('allows editing a task', async () => {
        const updatedTask = {
            _id: '1',
            title: 'Updated Task',
            description: 'Updated Desc',
            completed: false
        }
        axios.put.mockResolvedValue({ data: updatedTask })

        render(App, {
            global: {
                plugins: [router],
            },
        })
        await router.isReady()

        await screen.findByText('Task 1')

        const editButtons = await screen.findAllByText('Edit')
        await fireEvent.click(editButtons[0])

        const titleInput = screen.getByPlaceholderText('Task title')
        const descInput = screen.getByPlaceholderText('Task description')
        const submitButton = screen.getByText('Update Task')

        await fireEvent.update(titleInput, '')
        await fireEvent.update(titleInput, 'Updated Task')
        await fireEvent.update(descInput, '')
        await fireEvent.update(descInput, 'Updated Desc')
        await fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/tasks/1', {
                title: 'Updated Task',
                description: 'Updated Desc',
                completed: false,
            })
        })
    })

    it('allows deleting a task', async () => {
        axios.delete.mockResolvedValue({})

        render(App, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        await screen.findByText('Task 1')
        const deleteButtons = await screen.findAllByText('Delete')
        await fireEvent.click(deleteButtons[0])

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('/api/tasks/1')
        })
    })
})