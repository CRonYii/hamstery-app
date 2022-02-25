import { DeleteTwoTone, EditTwoTone, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Layout, Menu, Popconfirm, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryDeleteLib, hamsteryRefreshLib } from '../HamsteryAPI';
import { getAllLibs, selectAllLibraries } from './LibrarySlice';
import { TVSeasonPage } from './TVSeasonPage';
import { TVShowLibrary } from './TVShowLibrary';
import { TVShowPage } from './TVShowPage';


const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export function LibraryHome() {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<div>Please select a library</div>} />
        <Route path="*" element={<div>Please select a library</div>} />
        <Route path="/tvshows/:name" element={<TVShowLibrary />} />
        <Route path="/tvshows/:lib_name/:show_name" element={<TVShowPage />} />
        <Route path="/tvshows/:lib_name/:show_name/:season_number" element={<TVSeasonPage />} />
      </Route>
    </Routes>
  );
}

function HomeLayout() {
  const { appSecret } = useAppSelector(selectStatus);
  const [selectedLib, setSelectedLib] = useState('');
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllLibs(appSecret));
  }, [dispatch, appSecret]);

  const { tvShowLibs } = useAppSelector(selectAllLibraries);
  return <Layout>
    <Header className="header">
      <Tooltip title="Setting">
        <Button shape="circle" icon={<SettingOutlined />} />
      </Tooltip>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Layout className="site-layout-background" style={{ padding: '24px 0' }}>
        <Sider className="site-layout-background" width={200}>
          <Menu
            defaultOpenKeys={['tvshows', 'moveis']}
            mode="inline" style={{ height: '100%' }}
            selectedKeys={[selectedLib]}
          >
            <SubMenu key="tvshows" title="TV Shows">
              {
                tvShowLibs.map((lib) => {
                  const librayActions = <Menu>
                    {/* TODO: Support edit storage, needs diectory selcetor */}
                    <Menu.Item icon={<EditTwoTone />}>Edit</Menu.Item> 
                    <Menu.Item icon={<ReloadOutlined />} onClick={
                      async () => {
                        await hamsteryRefreshLib(appSecret, lib.name)
                        dispatch(getAllLibs(appSecret));
                      }
                    }>Rescan Library</Menu.Item>
                    <Popconfirm title={`The library "${lib.name}" will be removed. This can't be undone. Continue?`}
                      onConfirm={async () => {
                        await hamsteryDeleteLib(appSecret, lib.name)
                        dispatch(getAllLibs(appSecret));
                      }}>
                      <Menu.Item icon={<DeleteTwoTone twoToneColor="#eb2f96" />}>Delete</Menu.Item>
                    </Popconfirm>
                  </Menu>;
                  return <Menu.Item key={lib.name}>
                    <Dropdown overlay={librayActions} trigger={['contextMenu']} placement='bottomRight'>
                      <Link to={`/tvshows/${lib.name}`} onClick={() => setSelectedLib(lib.name)}>{lib.name}</Link>
                    </Dropdown>
                  </Menu.Item>
                })
              }
            </SubMenu>
            <SubMenu key="movies" title="Movies">
            </SubMenu>
          </Menu>
        </Sider>

        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Content>
  </Layout>
}