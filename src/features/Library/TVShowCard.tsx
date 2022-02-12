import React from 'react';

import { Card } from 'antd';
import { Show } from './LibrarySlice';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;

export function TVShowCard({ libName, show }: { libName: string, show: Show }) {
    const navigate = useNavigate();
    return <Card
        hoverable
        onClick={() => navigate(`/tv/${libName}/${encodeURIComponent(show.storage)}/${show.name}`)}
        style={{ width: 185 }}
        cover={< img alt="Poster" src={show.poster} />}
    >
        <Meta title={show.name} description={`${Object.values(show.seasons).length} seasons in total`} />
    </Card >;
}