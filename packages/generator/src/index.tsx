import * as React from 'react'
import { render } from 'react-dom'

import 'antd/dist/antd.css'
import './global.css?inline'

import { Layout } from '~/components/templates/Layout'

import { StartScreen } from '~/components/pages/StartScreen'

render(
  <Layout>
    <StartScreen />
  </Layout>,
  document.getElementById('app')!
)
