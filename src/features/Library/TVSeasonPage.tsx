import { CheckCircleTwoTone, CloudDownloadOutlined, ImportOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getTVShowSeason } from '../TMDB';
import { selectTVShow, selectTVShowSeason } from './LibrarySlice';


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
    const [episodes, setEpisodes] = useState<EpisodeReponse[]>([]);
    const { lib_name = '', show_name = '', season_number = '' } = useParams();
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
        <Typography.Title>{show_name} {seasonName}</Typography.Title>
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
                        actions.push(<ImportOutlined />);
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