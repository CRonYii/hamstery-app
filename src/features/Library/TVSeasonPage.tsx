import React, { ReactNode, useEffect, useState } from 'react';

import { Card, Col, Divider, Row, Typography } from 'antd';
import { CheckCircleTwoTone, CloudDownloadOutlined, ImportOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectLibrary, SourceType } from './LibrarySlice';
import { getTVShowDetails, getTVShowSeason } from '../TMDB';

const { Meta } = Card;

type EpisodeReponse = {
    air_date: string,
    name: string,
    still_path: string,
    season_number: number,
    episode_number: number,
};

export function TVSeasonPage() {
    const { tvShowLibs } = useAppSelector(selectLibrary);
    const { lib_name, storage, show_name, season_number } = useParams();
    const [seasonName, setSeasonName] = useState('');
    const [episodes, setEpisodes] = useState<EpisodeReponse[]>([]);
    useEffect(() => {
        async function getDetails() {
            if (!lib_name || !storage || !show_name || !season_number ||
                !tvShowLibs[lib_name] || !tvShowLibs[lib_name].storage[storage] || !tvShowLibs[lib_name].storage[storage].shows[show_name] ||
                !tvShowLibs[lib_name].storage[storage].shows[show_name].seasons[season_number])
                return;
            const data = await getTVShowSeason(show.metaSource.id, Number(season_number), 'zh-CN');
            setSeasonName(data.name);
            setEpisodes(data.episodes.filter((e: any) => new Date(e.air_date) < new Date()));
        }
        getDetails();
    }, [tvShowLibs]);
    if (!lib_name || !storage || !show_name || !season_number ||
        !tvShowLibs[lib_name] || !tvShowLibs[lib_name].storage[storage] || !tvShowLibs[lib_name].storage[storage].shows[show_name] ||
        !tvShowLibs[lib_name].storage[storage].shows[show_name].seasons[season_number]) {
        return <div />
    }
    const show = tvShowLibs[lib_name].storage[storage].shows[show_name];
    const season = show.seasons[season_number];
    if (show.metaSource.type !== SourceType.TMDB) {
        return <div>Unsupported</div>
    }
    const tvShowPoster = show.poster;
    return <div>
        <Typography.Title>{show_name} {seasonName}</Typography.Title>
        <Divider />
        <Row gutter={24} style={{ margin: 16 }} align='bottom'>
            {
                episodes.map((e) => {
                    const localFile = season.episodes[e.episode_number - 1];
                    const actions= [];
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