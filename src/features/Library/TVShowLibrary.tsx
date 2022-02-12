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
  //   const { appSecret } = useAppSelector(selectStatus);
  //   const dispatch = useAppDispatch();
  //   useEffect(() => {
  //     dispatch(getAllLibs(appSecret));
  //   }, [dispatch, appSecret]);

  if (!libName || !tvShowLibs[libName])
    return <div></div>;
  const lib = tvShowLibs[libName];
  let shows: Show[] = [];
  Object.values(lib.storage).forEach(l => { shows = [...shows, ...Object.values(l.shows)] });
  const showsView = _.chunk(shows, 6).map((a, i) => {
    return <Row key={i} gutter={24} style={{margin: 16}} align='bottom'>
      {a.map((show, j) => {
        return <Col span={4} key={j}><TVShowCard key={show.metaSource.id} show={show} /></Col>
      })}
    </Row>
  });

  return (
    <div>
      {showsView}
    </div>
  );
}
