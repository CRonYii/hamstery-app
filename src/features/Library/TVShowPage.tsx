import { Card, Col, Divider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getTVShowDetails } from '../TMDB';
import { selectTVShow } from './LibrarySlice';


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
    const { lib_name = '', show_name = '' } = useParams();
    const [seasons, setSeasons] = useState<SeasonReponse[]>([]);
    const show = useAppSelector(selectTVShow(lib_name, show_name));
    useEffect(() => {
        async function getDetails() {
            if (!show)
                return;
            const data = await getTVShowDetails(show.metaSource.id, 'zh-CN');
            setSeasons(data.seasons);
        }
        getDetails();
    }, [show]);

    if (!show)
        return <div />;
    const tvShowPoster = show.poster;
    return <div>
        <Typography.Title>{show_name}</Typography.Title>
        <Divider />
        <Row gutter={24} style={{ margin: 16 }} align='bottom'>
            {
                seasons.map((s) => {
                    return <Col key={s.season_number}>
                        <Card
                            hoverable
                            onClick={() => navigate(`/tvshows/${lib_name}/${show.name}/${s.season_number}`)}
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