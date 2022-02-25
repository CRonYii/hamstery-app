import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Divider, Row } from 'antd';
import React from 'react';
import { Link, useParams } from "react-router-dom";
import { useAppSelector } from '../../app/hooks';
import { selectTVShowsLibrary } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';

export function TVShowLibrary() {
  const { name = '' } = useParams();
  const lib = useAppSelector(selectTVShowsLibrary(name));
  if (!lib)
    return <div></div>
  const showsView = [...lib.shows].sort((a, b) => a.name.localeCompare(b.name)).map((show, i) => {
    return <Col key={i}><TVShowCard key={show.metaSource.id} libName={name} show={show} /></Col>
  });

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to={`/tvshows/${lib.name}`}>
            <HomeOutlined /> <span>{lib.name}</span>
          </Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <Row gutter={24} style={{ margin: 16 }} align='bottom'>
        {showsView}
      </Row>
    </div>
  );
}
