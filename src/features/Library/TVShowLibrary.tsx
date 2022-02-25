import { Col, Divider, Row, Typography } from 'antd';
import React from 'react';
import { useParams } from "react-router-dom";
import { useAppSelector } from '../../app/hooks';
import { selectTVShowsLibrary } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';

export function TVShowLibrary() {
  const { name = '' } = useParams();
  const lib = useAppSelector(selectTVShowsLibrary(name));
  if (!lib)
    return <div></div>
  const showsView = lib.shows.map((show, i) => {
    return <Col key={i}><TVShowCard key={show.metaSource.id} libName={name} show={show} /></Col>
  });

  return (
    <div>
      <Typography.Title>{name}</Typography.Title>
      <Divider />
      <Row gutter={24} style={{ margin: 16 }} align='bottom'>
        {showsView}
      </Row>
    </div>
  );
}
