import React, { useEffect, useState } from 'react';

import { Card, Col, Divider, Row, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectLibrary, SourceType } from './LibrarySlice';
import { getTVShowDetails } from '../TMDB';

const { Meta } = Card;

type SeasonReponse = {
    air_date: string,
    name: string,
    poster_path: string,
    season_number: number,
    episode_count: number,
};

export function TVShowPage() {
    const navigate = useNavigate();
    const { tvShowLibs } = useAppSelector(selectLibrary);
    const { lib_name, storage, show_name } = useParams();
    const [seasons, setSeasons] = useState<SeasonReponse[]>([]);
    useEffect(() => {
        async function getDetails() {
            if (!lib_name || !storage || !show_name || !tvShowLibs[lib_name] || !tvShowLibs[lib_name].storage[storage] || !tvShowLibs[lib_name].storage[storage].shows[show_name])
                return;
            const data = await getTVShowDetails(show.metaSource.id, 'zh-CN');
            console.log(data);
            setSeasons(data.seasons);
        }
        getDetails();
    }, []);
    if (!lib_name || !storage || !show_name || !tvShowLibs[lib_name] || !tvShowLibs[lib_name].storage[storage] || !tvShowLibs[lib_name].storage[storage].shows[show_name]) {
        return <div />
    }
    const show = tvShowLibs[lib_name].storage[storage].shows[show_name];
    const tvShowPoster = show.poster;
    if (show.metaSource.type !== SourceType.TMDB) {
        return <div>Unsupported</div>
    }
    return <div>

        <Typography.Title>{show_name}</Typography.Title>
        <Divider />
        <Row gutter={24} style={{margin: 16}} align='bottom'>
            {
                seasons.map((s) => {
                    return <Col key={s.season_number}>
                        <Card
                            hoverable
                            // onClick={() => navigate(`/tv/${libName}/${encodeURIComponent(show.storage)}/${show.name}`)}
                            style={{ width: 300 }}
                            cover={< img alt="Poster" src={s.poster_path ? `https://image.tmdb.org/t/p/w500/${s.poster_path}` : tvShowPoster} />}
                        >
                            <Meta title={`${s.name} (${s.air_date})`} description={`${s.episode_count} Episode${s.episode_count !== 1 ? 's' : ''}`} />
                        </Card >
                    </Col>;
                })
            }
        </Row>
    </div>;
}