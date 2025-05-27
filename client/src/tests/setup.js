import { config } from '@vue/test-utils'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

window.getComputedStyle = () => ({
    getPropertyValue: () => '',
    width: '100px',
    height: '100px'
})

window.matchMedia = window.matchMedia || (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
}))

config.global.plugins = [Antd]