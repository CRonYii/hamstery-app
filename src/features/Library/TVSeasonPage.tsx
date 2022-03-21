import { CheckCircleTwoTone, CloudDownloadOutlined, DeleteTwoTone, HomeOutlined, ImportOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Dropdown, Form, Input, Menu, message, Modal, Popconfirm, Progress, Row, Select, Steps, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryAddEpisodeToShow, hamsteryDownloadCancel, hamsteryDownloadMagnetEpisodeToShow, hamsteryDownloadStatus, hamsteryGetEpisode, hamsteryList, hamsterySearchResources } from '../HamsteryAPI';
import { formatBytes, isVideoFile, percentage } from '../Helper';
import { getTVShowSeason } from '../TMDB';
import { EpisodeStatus, selectTVShow, selectTVShowSeason, setEpisode } from './LibrarySlice';
import { PathSelector } from './PathSelector';

const { Meta } = Card;

type EpisodeReponse = {
  air_date: string,
  name: string,
  still_path: string,
  season_number: number,
  episode_number: number,
};

const getEpNumber = (title: string) => (title.match(/Ep|EP|[ E第【[](\d{2,3})(v\d)?[ 话回集\].】]/) || [])[1] || '0';

export function TVSeasonPage() {
  const [seasonName, setSeasonName] = useState('');
  const [importModal, setImportModal] = useState({ visible: false, ep: 0 });
  const [downloadModal, setDownloadModal] = useState({ visible: false, results: [], selectedKeys: [], loading: false, step: 0 });
  const [importSeasonModal, setImportSeasonModal] = useState({ visible: false, results: [], selectedKeys: [], loading: false, step: 0 });
  const [episodes, setEpisodes] = useState<EpisodeReponse[]>([]);
  const { lib_name = '', show_name = '', season_number = '' } = useParams();
  const dispatch = useAppDispatch();
  const { appSecret } = useAppSelector(selectStatus);
  const [form] = Form.useForm();
  const show = useAppSelector(selectTVShow(lib_name, show_name));
  const season = useAppSelector(selectTVShowSeason(lib_name, show_name, Number(season_number)));
  useEffect(() => {
    async function getDetails() {
      if (!show?.metaSource?.id)
        return;
      const data = await getTVShowSeason(show.metaSource.id, Number(season_number), 'zh-CN');
      setSeasonName(data.name);
      setEpisodes(data.episodes
        /* air_date is yyyy-mm-dd and may also have time difference so we shift one day back when comapring */
        .filter((e: any) => new Date(e.air_date).getTime() < (new Date().getTime() + (1000 * 3600 * 24)))
      );
    }
    getDetails();
  }, [show?.metaSource?.id, season_number]);
  useEffect(() => {
    if (!show || !season)
      return;
    const timerid = setInterval(() => {
      season.episodes.forEach(async (episode) => {
        if (episode.status !== EpisodeStatus.DOWNLOADING)
          return;
        try {
          const episodeInfo = await hamsteryDownloadStatus(appSecret, episode.path);
          dispatch(setEpisode({
            episode: { ...episode, ...episodeInfo },
            lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: episode.episodeNumber
          }));
        } catch (e: any) {
          if (e?.response?.status === 422) {
            /* Task does not exist, may have already finish */
            const episodeInfo = await hamsteryGetEpisode(appSecret, lib_name, show._id, season.seasonNumber, episode.episodeNumber);
            dispatch(setEpisode({
              episode: { ...episode, ...episodeInfo },
              lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: episode.episodeNumber
            }));
          }
        }
      });
    }, 1000);
    return () => clearInterval(timerid);
  }, [dispatch, appSecret, lib_name, show, season]);
  if (!show || !season)
    return <div />
  const tvShowPoster = show.poster;

  const handleDownloadSearch = async (keyword: string) => {
    if (keyword.trim() === '')
      return;
    setDownloadModal({ ...downloadModal, loading: true });
    try {
      const results = await hamsterySearchResources(appSecret, 'dmhy', keyword, 50);
      setDownloadModal({ ...downloadModal, loading: false, results });
    } catch (e: any) {
      message.error(e?.message || 'Something went wrong');
      setDownloadModal({ ...downloadModal, loading: false });
    }
  };

  const handleDownloadSubmit = async (data: { episodes: { name: string, ep: number }[] }) => {
    setDownloadModal({ visible: false, results: [], selectedKeys: [], loading: false, step: 0 });
    await Promise.all(data.episodes.map(async ({ name, ep }) => {
      const resource: any = downloadModal.results.find(({ title }) => title === name);
      if (!resource)
        return;
      const hide = message.loading(`Preparing Download ${show.name} ${seasonName} ${ep}...`, 0);
      try {
        const id = await hamsteryDownloadMagnetEpisodeToShow(appSecret, resource.link, lib_name, show._id, season.seasonNumber, ep);
        dispatch(setEpisode({
          episode: {
            episodeNumber: ep,
            status: EpisodeStatus.DOWNLOADING,
            path: id,
          }, lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: ep
        }));
      } catch (e: any) {
        message.error(e?.response?.data?.reason || 'Something went wrong');
      } finally {
        hide();
      }
    }));
  }

  const downloadModalActions = [];
  const downloadModalSteps = [
    {
      title: 'Choose Resources', content: <div><Input.Search placeholder='keyword' defaultValue={show_name} loading={downloadModal.loading}
        enterButton="Search" size="large" onSearch={handleDownloadSearch} />
        <Table
          rowKey='title'
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
              sorter: (a: any, b: any) => (new Date(a.date).getTime() - new Date(b.date).getTime())
            },
            {
              title: 'Title',
              dataIndex: 'title',
              sorter: (a: any, b: any) => a.title.localeCompare(b.title),
            },
            {
              title: 'Size',
              dataIndex: 'size',
            },
            {
              title: 'Popularity',
              dataIndex: 'popularity',
              sorter: (a: any, b: any) => a.popularity - b.popularity,
            }
          ]} dataSource={downloadModal.results}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: downloadModal.selectedKeys,
            onChange: (selectedRowKeys: any) => setDownloadModal({ ...downloadModal, selectedKeys: selectedRowKeys })
          }}
        /></div>
    },
    {
      title: 'Start Download',
      content: <Form
        id="downloadShows"
        name="downloadShows"
        labelCol={{ span: 24 }}
        onFinish={handleDownloadSubmit}
      >
        <Form.List name="episodes"
          rules={[
            {
              validator: async (_, eps: { name: string, ep: number }[]) => {
                if (eps.some(ep => ep.ep === undefined))
                  return Promise.reject(new Error('You must choose an episode for each resource selected.'));
                if (new Set(eps.map(ep => ep.ep)).size !== eps.length)
                  return Promise.reject(new Error('Cannot download multiple resouces for a single episode.'));
              }
            }
          ]}>
          {(_, __, { errors }) =>
            <div>
              {downloadModal.selectedKeys
                .map(key => downloadModal.results.find(({ title }) => title === key))
                .map((item: any, index) => {
                  const guessEp = Number(getEpNumber(item.title));
                  return <Form.Item key={item.title}>
                    <Form.Item name={[index, 'name']} initialValue={item.title} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item label={item.title} name={[index, 'ep']} initialValue={guessEp === 0 ? undefined : guessEp}>
                      <Select>
                        {season.episodes
                          .filter((e) => e.status === EpisodeStatus.MISSING && episodes[e.episodeNumber - 1])
                          .map((e) => <Select.Option key={e.episodeNumber} value={e.episodeNumber}>EP {e.episodeNumber}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Form.Item>
                })
              }
              <Form.ErrorList errors={errors} />
            </div>
          }
        </Form.List>
      </Form>
    }
  ];
  if (downloadModal.step < downloadModalSteps.length - 1) {
    downloadModalActions.push(<Button key='next' type="primary" onClick={() => setDownloadModal({ ...downloadModal, step: downloadModal.step + 1 })}>Next</Button>);
  }
  if (downloadModal.step > 0) {
    downloadModalActions.push(<Button key='previous' onClick={() => setDownloadModal({ ...downloadModal, step: downloadModal.step - 1 })}>Previous</Button>);
  }
  if (downloadModal.step === downloadModalSteps.length - 1) {
    downloadModalActions.push(<Button key='submit' form="downloadShows" type="primary" htmlType="submit">Submit</Button>);
  }

  const DownloadModal = <Modal
    title={`Download ${lib_name} / ${show_name} / ${seasonName}`}
    visible={downloadModal.visible}
    style={{ minWidth: '100vh' }}
    footer={downloadModalActions}
    onCancel={() => setDownloadModal({ ...downloadModal, visible: false })}
  >
    <Steps current={downloadModal.step} progressDot type="navigation" size="small">
      {downloadModalSteps.map(item => <Steps.Step key={item.title} title={item.title} />)}
    </Steps>
    {downloadModalSteps[downloadModal.step].content}
  </Modal>;

  const ImportModal = <Modal
    title={`Import to ${lib_name} / ${show_name} / ${seasonName} E${importModal.ep}`}
    visible={importModal.visible}
    footer={[
      <Button key='submit' form="importShow" type="primary" htmlType="submit">Submit</Button>,
    ]}
    onCancel={() => setImportModal({ visible: false, ep: 0 })}
  >
    <Form
      form={form}
      id="importShow"
      name="importShow"
      labelCol={{ span: 4 }}
      onFinish={async ({ file: filename }) => {
        const hide = message.loading('Importing...', 0);
        try {
          await hamsteryAddEpisodeToShow(appSecret, filename, lib_name, show._id, season.seasonNumber, importModal.ep);
          dispatch(setEpisode({
            episode: {
              episodeNumber: importModal.ep,
              status: EpisodeStatus.DOWNLOAED,
              path: filename
            }, lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: importModal.ep
          }));
          setImportModal({ visible: false, ep: 0 });
        } catch (e: any) {
          message.error(e?.response?.data?.reason || 'Something went wrong');
        } finally {
          hide();
        }
      }}
      autoComplete="off"
    >
      <Form.Item
        label="File"
        name="file"
        rules={[{ required: true, message: 'Please select a file!' }]}
      >
        <PathSelector type='file' />
      </Form.Item>
    </Form>
  </Modal>;

  const SeasonContextMenu = <Menu>
    <Menu.Item key='importSeason' icon={<ImportOutlined />} onClick={() => setImportSeasonModal({ ...importSeasonModal, visible: true })}>Import Whole Season</Menu.Item>
  </Menu>;

  const importSeasonModalActions = [];
  const importSeasonModalSteps = [
    {
      title: 'Choose Directory',
      content:
        <div>
          <PathSelector onChange={async (dir: any) => {
            const { file } = await hamsteryList(appSecret, dir);
            setImportSeasonModal({
              ...importSeasonModal,
              results: file.filter((f: any) => isVideoFile(f.title))
            });
          }} />
          <Table
            rowKey='title'
            columns={[
              {
                title: 'Title',
                dataIndex: 'title',
                sorter: (a: any, b: any) => a.title.localeCompare(b.title),
              }
            ]} dataSource={importSeasonModal.results}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: importSeasonModal.selectedKeys,
              onChange: (selectedRowKeys: any) => setImportSeasonModal({ ...importSeasonModal, selectedKeys: selectedRowKeys })
            }}
          /></div>
    },
    {
      title: 'Select episodes',
      content: <Form
        id="importSeason"
        name="importSeason"
        labelCol={{ span: 24 }}
        onFinish={async (data: { episodes: { name: string, ep: number }[] }) => {
          console.log(data);
          setImportSeasonModal({ visible: false, results: [], selectedKeys: [], loading: false, step: 0 });
          await Promise.all(data.episodes.map(async ({ name, ep }) => {
            const resource: any = importSeasonModal.results.find(({ title }) => title === name);
            if (!resource)
              return;
            const hide = message.loading(`Importing ${show.name} ${seasonName} ${ep}...`, 0);
            try {
              await hamsteryAddEpisodeToShow(appSecret, resource.key, lib_name, show._id, season.seasonNumber, ep);
              dispatch(setEpisode({
                episode: {
                  episodeNumber: ep,
                  status: EpisodeStatus.DOWNLOAED,
                  path: resource.path,
                }, lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: ep
              }));
            } catch (e: any) {
              message.error(e?.response?.data?.reason || 'Something went wrong');
            } finally {
              hide();
            }
          }));
        }}
      >
        <Form.List name="episodes"
          rules={[
            {
              validator: async (_, eps: { name: string, ep: number }[]) => {
                if (eps.some(ep => ep.ep === undefined))
                  return Promise.reject(new Error('You must choose an episode for each resource selected.'));
                if (new Set(eps.map(ep => ep.ep)).size !== eps.length)
                  return Promise.reject(new Error('Cannot download multiple resouces for a single episode.'));
              }
            }
          ]}>
          {(_, __, { errors }) =>
            <div>
              {importSeasonModal.selectedKeys
                .map(key => importSeasonModal.results.find(({ title }) => title === key))
                .map((item: any, index) => {
                  const guessEp = Number(getEpNumber(item.title));
                  return <Form.Item key={item.title}>
                    <Form.Item name={[index, 'name']} initialValue={item.title} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item label={item.title} name={[index, 'ep']} initialValue={guessEp === 0 ? undefined : guessEp}>
                      <Select>
                        {season.episodes
                          .filter((e) => e.status === EpisodeStatus.MISSING && episodes[e.episodeNumber - 1])
                          .map((e) => <Select.Option key={e.episodeNumber} value={e.episodeNumber}>EP {e.episodeNumber}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Form.Item>
                })
              }
              <Form.ErrorList errors={errors} />
            </div>
          }
        </Form.List>
      </Form>
    }
  ];
  if (importSeasonModal.step < importSeasonModalSteps.length - 1) {
    importSeasonModalActions.push(<Button key='next' type="primary" onClick={() => setImportSeasonModal({ ...importSeasonModal, step: importSeasonModal.step + 1 })}>Next</Button>);
  }
  if (importSeasonModal.step > 0) {
    importSeasonModalActions.push(<Button key='previous' onClick={() => setImportSeasonModal({ ...importSeasonModal, step: importSeasonModal.step - 1 })}>Previous</Button>);
  }
  if (importSeasonModal.step === importSeasonModalSteps.length - 1) {
    importSeasonModalActions.push(<Button key='submit' form="importSeason" type="primary" htmlType="submit">Submit</Button>);
  }

  const ImportSeasonModal = <Modal
    title={`Import to ${lib_name} / ${show_name} / ${seasonName}`}
    visible={importSeasonModal.visible}
    style={{ minWidth: '100vh' }}
    footer={importSeasonModalActions}
    onCancel={() => setImportSeasonModal({ ...importSeasonModal, visible: false })}
  >
    <Steps current={importSeasonModal.step} progressDot type="navigation" size="small">
      {importSeasonModalSteps.map(item => <Steps.Step key={item.title} title={item.title} />)}
    </Steps>
    {importSeasonModalSteps[importSeasonModal.step].content}
  </Modal>;

  return <div>
    {DownloadModal}
    {ImportSeasonModal}
    {ImportModal}
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to={`/tvshows/${lib_name}`}>
          <HomeOutlined /> <span>{lib_name}</span>
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/tvshows/${lib_name}/${show_name}`}>
          {show_name}
        </Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Dropdown overlay={SeasonContextMenu} trigger={['click', 'contextMenu']}>
          <button>{seasonName}</button>
        </Dropdown>
      </Breadcrumb.Item>
    </Breadcrumb>
    <Divider />
    <Row gutter={24} style={{ margin: 16 }} align='bottom'>
      {
        episodes.map((e) => {
          const { status, downloadSpeed = 0, completedLength = 0, totalLength = 0, path } = season.episodes[e.episode_number - 1];
          const actions = [];
          if (status === EpisodeStatus.MISSING) {
            actions.push(<CloudDownloadOutlined onClick={() => setDownloadModal({ ...downloadModal, visible: true })} />);
            actions.push(<ImportOutlined onClick={() => setImportModal({ visible: true, ep: e.episode_number })} />);
          } else if (status === EpisodeStatus.DOWNLOADING) { /* TODO: useEffect() or manully refresh to poll status? */
            actions.push(
              <Popconfirm title={"The download will be cancelled!"} onConfirm={() => hamsteryDownloadCancel(appSecret, path)}>
                <DeleteTwoTone twoToneColor="#eb2f96" />
              </Popconfirm>
            );
          } else {
            actions.push(<CheckCircleTwoTone twoToneColor="#52c41a" />);
          }
          return <Col key={e.episode_number}>
            <Card
              hoverable
              style={{ width: 185 }}
              cover={< img alt="Poster" src={e.still_path ? `https://image.tmdb.org/t/p/w185/${e.still_path}` : tvShowPoster} />}
              actions={actions}
            >
              <Meta title={`EP ${e.episode_number}`} description={`${e.name} (${e.air_date})`} />
              {status === EpisodeStatus.DOWNLOADING ?
                <div>
                  <Progress size='small' percent={Number(percentage(completedLength, totalLength).toFixed(2))} />
                  <div style={{ fontSize: 'small', color: 'gray' }}>
                    {totalLength === 0 ? 'Preparing...' : <span>{formatBytes(totalLength)} {formatBytes(downloadSpeed)}/s</span>}
                  </div>
                </div>
                : null}

            </Card >
          </Col>;
        })
      }
    </Row>
  </div >;
}