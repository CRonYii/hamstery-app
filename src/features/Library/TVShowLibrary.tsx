import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { useAppSelector } from '../../app/hooks';
import { useParams } from "react-router-dom";
import { selectLibrary, Show } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';
import _ from 'lodash';

export function TVShowLibrary() {
  const { name: libName } = useParams();
  const { tvShowLibs } = useAppSelector(selectLibrary);

  if (!libName || !tvShowLibs[libName])
    return <div></div>;
  const lib = tvShowLibs[libName];
  let shows: Show[] = [];
  Object.values(lib.storage).forEach(l => { shows = [...shows, ...Object.values(l.shows)] });
  const showsView = shows.map((show, i) => {
    return <Col key={i}><TVShowCard key={show.metaSource.id} libName={libName} show={show} /></Col>
  });

  return (
    <Row gutter={24} style={{ margin: 16 }} align='bottom'>
      {showsView}
    </Row>
  );
}
