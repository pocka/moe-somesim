import { useToggle } from '@react-comfy/hooks'
import { StyleableProps } from '@react-comfy/props'
import { Layout as AntdLayout, Icon, Menu } from 'antd'
import cs from 'classnames'
import * as React from 'react'

import styles from './styles.css?module'

const { Sider, Content } = AntdLayout

interface Props {
  /**
   * On user clicking help button.
   */
  onHelp?(): void

  /**
   * On user clicking reset button then confirm to resetting.
   */
  onReset?(): void
}

export const Layout: React.FC<Props & StyleableProps> = ({
  children,
  className,
  onHelp,
  onReset,
  ...rest
}) => {
  const [menuCollapsed, toggleMenuCollapsed] = useToggle(false)

  return (
    <AntdLayout className={cs(styles.container, className)} {...rest}>
      <Sider
        collapsible
        collapsed={menuCollapsed}
        onCollapse={toggleMenuCollapsed}
      >
        <Menu theme="dark" mode="inline">
          <Menu.Item key="build">
            <Icon type="plus" />
            <span className={styles.menuText}>画像を作る</span>
          </Menu.Item>
          <Menu.Item key="help">
            <Icon type="question-circle" />
            <span className={styles.menuText}>ヘルプ</span>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content className={styles.content}>{children}</Content>
    </AntdLayout>
  )
}

export default Layout
