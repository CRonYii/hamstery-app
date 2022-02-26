import { CheckCircleTwoTone, CloudDownloadOutlined, HomeOutlined, ImportOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Form, Input, message, Modal, Row, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryAddEpisodeToShow, hamsterySearchResources } from '../HamsteryAPI';
import { getTVShowSeason } from '../TMDB';
import { addEpisodeToShow, EpisodeStatus, selectTVShow, selectTVShowSeason } from './LibrarySlice';
import { PathSelector } from './PathSelector';

const { Meta } = Card;

type EpisodeReponse = {
    air_date: string,
    name: string,
    still_path: string,
    season_number: number,
    episode_number: number,
};

const getEpNumber = (title: string) => (title.match(/[ 【[](\d{2})(v\d)?[ \]】]/) || [])[1] || '?';

export function TVSeasonPage() {
    const [seasonName, setSeasonName] = useState('');
    const [importModal, setImportModal] = useState({ visible: false, ep: 0 });
    const [downloadModal, setDownloadModal] = useState({ visible: false, results: [], selectedKeys: [], loading: false });
    const [episodes, setEpisodes] = useState<EpisodeReponse[]>([]);
    const { lib_name = '', show_name = '', season_number = '' } = useParams();
    const dispatch = useAppDispatch();
    const { appSecret } = useAppSelector(selectStatus);
    const [form] = Form.useForm();
    const show = useAppSelector(selectTVShow(lib_name, show_name));
    const season = useAppSelector(selectTVShowSeason(lib_name, show_name, Number(season_number)));
    useEffect(() => {
        async function getDetails() {
            if (!show || !season)
                return;
            const data = await getTVShowSeason(show.metaSource.id, Number(season_number), 'zh-CN');
            setSeasonName(data.name);
            setEpisodes(data.episodes.filter((e: any) => new Date(e.air_date) < new Date()));
        }
        getDetails();
    }, [show, season, season_number]);
    if (!show || !season)
        return <div />
    const tvShowPoster = show.poster;

    const handleDownloadSearch = async (keyword: string) => {
        if (keyword.trim() === '')
            return;
        setDownloadModal({ ...downloadModal, loading: true });
        const results = await hamsterySearchResources(appSecret, 'dmhy', keyword, 50);
        setDownloadModal({ ...downloadModal, loading: false, results });
    };

    const handleDownloadSubmit = async () => {
        console.log(lib_name, show._id, season.seasonNumber,
            downloadModal.selectedKeys.map(key => downloadModal.results.find(({ title }) => title === key)));

    }

    const DownloadModal = <Modal
        title={`Download to ${lib_name} / ${show_name} / ${seasonName}`}
        visible={downloadModal.visible}
        style={{ minWidth: '100vh' }}
        footer={[
            <Button key='submit' type="primary" onClick={handleDownloadSubmit}>Submit</Button>,
        ]}
        onCancel={() => setDownloadModal({ ...downloadModal, visible: false })}
    >
        <Input.Search placeholder='keyword' defaultValue={show_name} loading={downloadModal.loading}
            enterButton="Search" size="large" onSearch={handleDownloadSearch} />
        <Table
            rowKey='title'
            columns={[
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
        />
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
                console.log(lib_name, show._id, season.seasonNumber, importModal.ep, filename);

                const hide = message.loading('Importing...', 0);
                try {
                    await hamsteryAddEpisodeToShow(appSecret, filename, lib_name, show._id, season.seasonNumber, importModal.ep);
                    dispatch(addEpisodeToShow({ filename, lib_name, tv_show: show.name, season_number: season.seasonNumber, ep_number: importModal.ep }));
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

    return <div>
        {DownloadModal}
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
                {seasonName}
            </Breadcrumb.Item>
        </Breadcrumb>
        <Divider />
        <Row gutter={24} style={{ margin: 16 }} align='bottom'>
            {
                episodes.map((e) => {
                    const { status } = season.episodes[e.episode_number - 1];
                    const actions = [];
                    if (status !== EpisodeStatus.MISSING)
                        actions.push(<CheckCircleTwoTone twoToneColor="#52c41a" />);
                    else {
                        actions.push(<CloudDownloadOutlined onClick={() => setDownloadModal({ ...downloadModal, visible: true })} />);
                        actions.push(<ImportOutlined onClick={() => setImportModal({ visible: true, ep: e.episode_number })} />);
                    }
                    return <Col key={e.episode_number}>
                        <Card
                            hoverable
                            style={{ width: 185 }}
                            cover={< img alt="Poster" src={e.still_path ? `https://image.tmdb.org/t/p/w185/${e.still_path}` : tvShowPoster} />}
                            actions={actions}
                        >
                            <Meta title={`EP ${e.episode_number}`} description={`${e.name} (${e.air_date})`} />
                        </Card >
                    </Col>;
                })
            }
        </Row>
    </div>;
}