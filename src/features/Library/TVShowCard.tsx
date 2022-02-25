import React from 'react';

import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ITVShow } from './LibrarySlice'

const { Meta } = Card;

export function TVShowCard({ libName, show }: { libName: string, show: ITVShow }) {
    const navigate = useNavigate();
    return <Card
        hoverable
        onClick={() => navigate(`/tvshows/${libName}/${show.name}`)}
        style={{ width: 185 }}
        cover={< img alt="Poster" src={show.poster} />}
    >
        <Meta title={show.name} description={`${Object.values(show.seasons).length} seasons in total`} />
    </Card >;
}