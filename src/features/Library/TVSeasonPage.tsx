import { CheckCircleTwoTone, CloudDownloadOutlined, HomeOutlined, ImportOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Form, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryAddEpisodeToShow } from '../HamsteryAPI';
import { getTVShowSeason } from '../TMDB';
import { addEpisodeToShow, selectTVShow, selectTVShowSeason } from './LibrarySlice';
import { PathSelector } from './PathSelector';


const { Meta } = Card;

type EpisodeReponse = {
    air_date: string,
    name: string,
    still_path: string,
    season_number: number,
    episode_number: number,
};

export function TVSeasonPage() {
    const [seasonName, setSeasonName] = useState('');
    const [importModal, setImportModal] = useState({ visible: false, ep: 0 });
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
    return <div>
        <Modal
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
                >
                    <PathSelector type='file' />
                </Form.Item>
            </Form>
        </Modal>
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
                    const localFile = season.episodes[e.episode_number - 1];
                    const actions = [];
                    if (localFile)
                        actions.push(<CheckCircleTwoTone twoToneColor="#52c41a" />);
                    else {
                        actions.push(<CloudDownloadOutlined />);
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