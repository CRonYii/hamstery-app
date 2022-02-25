import { SettingOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
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
  const navigate = useNavigate();
  const { appSecret } = useAppSelector(selectStatus);
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
          >
            <SubMenu key="tvshows" title="TV Shows">
              {
                tvShowLibs.map((lib) => {
                  return <Menu.Item key={lib.name}>
                    <Link to={`/tvshows/${lib.name}`}>{lib.name}</Link>
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