import React, { useEffect } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { Row, Col, Typography, Divider, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useParams } from "react-router-dom";
import { getAllLibs, selectLibrary, Show } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';
import _ from 'lodash';
import { selectStatus } from '../GlobalSlice';
import { hamsteryrefreshLib } from '../HamsteryAPI';

export function TVShowLibrary() {
  const { name: libName } = useParams();
  const { appSecret, librarySelected } = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
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
    <div>
      <Typography.Title>{libName}</Typography.Title>
      <Row gutter={24} align='middle'>
        <Button icon={<ReloadOutlined />}
          onClick={async () => {
            console.log(appSecret);
            
            await hamsteryrefreshLib(appSecret, libName)
            dispatch(getAllLibs(appSecret));

          }}>Refresh</Button>
      </Row>
      <Divider />
      <Row gutter={24} style={{ margin: 16 }} align='bottom'>
        {showsView}
      </Row>
    </div>
  );
}
