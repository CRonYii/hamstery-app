import React from 'react';

import { Card } from 'antd';
import { Show } from './LibrarySlice';

const { Meta } = Card;

export function TVShowCard({ show }: { show: Show }) {
    return <Card
        hoverable
        style={{ width: 240 }
        }
        cover={< img alt="Poster" src={show.poster} />}
    >
        <Meta title={show.name} description={`${Object.values(show.seasons).length} seasons in total`} />
    </Card >;
}