import React, { useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Button, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { getAllLibs, selectLibrary } from './LibrarySlice';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { TVShowLibrary } from './TVShowLibrary';
import { TVShowPage } from './TVShowPage';
import { TVSeasonPage } from './TVSeasonPage';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export function LibraryHome() {
  const navigate = useNavigate();
  const { appSecret, librarySelected } = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllLibs(appSecret));
  }, [dispatch, appSecret]);
  const { tvShowLibs } = useAppSelector(selectLibrary);

  return (
    <Layout>
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
                  Object.values(tvShowLibs).map((lib) => {
                    return <Menu.Item key={lib.name}
                      onClick={() => navigate(`/lib/${lib.name}`)}>
                      {lib.name}
                    </Menu.Item>
                  })
                }
              </SubMenu>
              <SubMenu key="movies" title="Movies">
              </SubMenu>
            </Menu>
          </Sider>

          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<div>Please select a library</div>} />
              <Route path="/lib/:name" element={<TVShowLibrary />} />
              <Route path="/tv/:lib_name/:storage/:show_name" element={<TVShowPage />} />
              <Route path="/season/:lib_name/:storage/:show_name/:season_number" element={<TVSeasonPage />} />
            </Routes>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
}
