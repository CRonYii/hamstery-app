import { DeleteTwoTone, EditTwoTone, FolderAddTwoTone, PlusOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, Layout, Menu, message, Modal, Popconfirm, Radio, Select, Tooltip } from 'antd';
import debounce from 'lodash/debounce';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAddLibraryodal, selectAddShowModal, selectStatus, setAddLibraryModal, setAddShowModal } from '../GlobalSlice';
import { hamsteryAddLib, hamsteryAddShowToLib, hamsteryDeleteLib, hamsteryRefreshLib } from '../HamsteryAPI';
import { searchTVShowsAll, TMDB_IMAGE500_URL } from '../TMDB';
import { addShowToLib, getAllLibs, getLibByName, removeLib, selectAllLibraries } from './LibrarySlice';
import { PathSelector } from './PathSelector';
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
  const dispatch = useAppDispatch();
  const [selectedLib, setSelectedLib] = useState('');
  useEffect(() => {
    dispatch(getAllLibs(appSecret));
  }, [dispatch, appSecret]);

  const { tvShowLibs } = useAppSelector(selectAllLibraries);
  return <Layout>
    <AddLibraryModal />
    <AddShowModal />
    <Header className="header">
      <Tooltip title="Setting">
        <Button shape="circle" icon={<SettingOutlined />} />
      </Tooltip>
      <Button icon={<PlusOutlined />} onClick={() => dispatch(setAddLibraryModal(true))} style={{ marginLeft: 12 }}>Add Library</Button>
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
              {tvShowLibs.map(lib => <Menu.Item key={lib.name}>
                <Dropdown overlay={LibraryContextMenu(lib.name, appSecret, dispatch, () => dispatch(setAddShowModal({ visible: true, library: lib })))} trigger={['contextMenu']}>
                  <Link to={`/tvshows/${lib.name}`} onClick={() => setSelectedLib(lib.name)}>{lib.name}</Link>
                </Dropdown>
              </Menu.Item>)}
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

interface SearchResult {
  name: string, id: number, first_air_date: string, poster_path: string
}

function AddLibraryModal() {
  const navigate = useNavigate();
  const visible = useAppSelector(selectAddLibraryodal);
  const dispatch = useAppDispatch();
  const { appSecret } = useAppSelector(selectStatus);
  const [form] = Form.useForm();
  const closeModal = () => dispatch(setAddLibraryModal(false));

  return <Modal title="Add Library" visible={visible} onCancel={closeModal}
    footer={[
      <Button key='submit' form="addLib" type="primary" htmlType="submit">Submit</Button>,
    ]}>
    <Form
      form={form}
      id="addLib"
      name="addLib"
      labelCol={{ span: 4 }}
      initialValues={{ type: 'tvshows' }}
      onFinish={async (data) => {
        const hide = message.loading('Adding library...', 0);
        try {
          await hamsteryAddLib(appSecret, data);
          dispatch(getLibByName({ appSecret, name: data.name }));
          navigate(`/tvshows/${data.name}`);
          form.resetFields();
          closeModal();
        } catch (e: any) {
          message.error(e?.message || 'Something went wrong');
        } finally {
          hide();
        }
      }}
      autoComplete="off"
    >
      <Form.Item
        label="Type"
        name="type"
      >
        <Radio.Group
          options={[{ label: 'TV Shows', value: 'tvshows' }, { label: 'Movies', value: 'movies', disabled: true }]}
          optionType="button"
          buttonStyle="solid" />
      </Form.Item>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input library name!' }]}
      >
        <Input />
      </Form.Item>
      <Form.List
        name="storage"
      >
        {(fields, { add, remove }) => {
          return <div>
            {fields.map((field, index) => {
              return <div key={field.key}>
                <Form.Item label="Storage" style={{ marginBottom: 0 }}>
                  <Form.Item
                    name={[index]}
                    style={{ display: 'inline-block' }}
                    rules={[{ required: true, message: 'Storage cannot be empty!' }]}
                  >
                    <PathSelector />
                  </Form.Item>
                  <Button
                    danger
                    icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                    onClick={() => remove(field.name)} />
                </Form.Item>
              </div>
            })}
            <Button type="dashed" onClick={() => add()}><PlusOutlined /> Add Storage</Button>
          </div>
        }}
      </Form.List>
    </Form>
  </Modal>
}

function AddShowModal() {
  const dispatch = useAppDispatch();
  const { visible, library } = useAppSelector(selectAddShowModal);
  const { appSecret } = useAppSelector(selectStatus);
  const [keyword, setKeyword] = useState('');
  const [poster, setPoster] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [form] = Form.useForm();

  const closeModal = () => dispatch(setAddShowModal({ visible: false, library: undefined }));
  const handleSearch = async (keyword: string) => {
    if (keyword.trim() === '')
      return setSearchResults([]);
    const data = await searchTVShowsAll(keyword, 'zh-CN'); /* TODO: Language Option */
    setSearchResults(data.map((show: SearchResult) => ({
      name: show.name, id: show.id, first_air_date: show.first_air_date, poster_path: TMDB_IMAGE500_URL + show.poster_path
    })));
  };

  if (!library)
    return <div></div>

  return <Modal
    title="Add show"
    style={{ minWidth: '80vh' }}
    visible={visible}
    footer={[<Button key="submit" form="addshow" type="primary" htmlType="submit">Add</Button>]}
    onCancel={closeModal}
  >
    <Form
      form={form}
      id="addshow"
      name="addshow"
      labelCol={{ span: 4 }}
      onFinish={async (data) => {
        const { storage, tmdb_id } = data;
        const hide = message.loading('Adding show...', 0);
        try {
          const id = await hamsteryAddShowToLib(appSecret, library.name, storage, tmdb_id, 'zh-CN');
          dispatch(addShowToLib({ appSecret, lib: library.name, show_id: id }))

          closeModal();
        } catch (e: any) {
          message.error(e?.response?.data?.reason || 'Something went wrong');
        } finally {
          hide();
        }
      }}
      autoComplete="off"
    >
      <Form.Item
        label="Storage"
        name="storage"
        rules={[{ required: true, message: 'Please select a storage!' }]}
      >
        <Select>
          {library.storage.map((s) => <Select.Option key={s._id} value={s._id}>{s.directory}</Select.Option>)}
        </Select>
      </Form.Item>
      <Form.Item
        label="TV Show"
        name="tmdb_id"
        rules={[{ required: true, message: 'Please select a TV Show!' }]}
      >
        <Select
          showSearch
          value={keyword}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          notFoundContent={null}
          onSearch={debounce(handleSearch, 250)}
          onChange={keyword => setKeyword(keyword)}
          onSelect={(value: any, option: any) => setPoster(searchResults[Number(option.key)].poster_path)}
        >
          {searchResults.map((show, idx) => <Select.Option key={idx} value={show.id}>{show.name} - {show.first_air_date}</Select.Option>)}
        </Select>
      </Form.Item>
    </Form>
    <img src={poster} style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
  </Modal>
}

export function LibraryContextMenu(name: string, appSecret: string, dispatch: any, addShowModal: any) {
  return <Menu>
    {/* TODO: Support edit storage, needs diectory selcetor */}
    <Menu.Item key='edit' icon={<EditTwoTone />}>Edit</Menu.Item>
    <Menu.Item key='addshow' icon={<FolderAddTwoTone twoToneColor="#52c41a" />} onClick={() => addShowModal()}>Add Show</Menu.Item>
    <Menu.Item key='refresh' icon={<ReloadOutlined />} onClick={
      async () => {
        const hide = message.loading('Rescan in progress...', 0);
        try {
          await hamsteryRefreshLib(appSecret, name)
          dispatch(getLibByName({ appSecret, name }));
        } catch (e: any) {
          message.error(e?.message || 'Something went wrong');
        } finally {
          hide();
        }
      }
    }>Rescan Library</Menu.Item>
    <Popconfirm title={`The library "${name}" will be removed. This can't be undone. Continue?`}
      onConfirm={async () => {
        await hamsteryDeleteLib(appSecret, name)
        dispatch(removeLib(name));
      }}>
      <Menu.Item key='delete' icon={<DeleteTwoTone twoToneColor="#eb2f96" />}>Delete</Menu.Item>
    </Popconfirm>
  </Menu>;
}