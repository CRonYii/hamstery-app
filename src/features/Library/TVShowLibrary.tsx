import { ReloadOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Row, Typography } from 'antd';
import React from 'react';
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus } from '../GlobalSlice';
import { hamsteryrefreshLib } from '../HamsteryAPI';
import { getAllLibs, selectTVShowsLibrary } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';

export function TVShowLibrary() {
  const { name = '' } = useParams();
  const { appSecret } = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const lib = useAppSelector(selectTVShowsLibrary(name));
  if (!lib)
    return <div></div>
  const showsView = lib.shows.map((show, i) => {
    return <Col key={i}><TVShowCard key={show.metaSource.id} libName={name} show={show} /></Col>
  });

  return (
    <div>
      <Typography.Title>{name}</Typography.Title>
      <Row gutter={24} align='middle'>
        <Button icon={<ReloadOutlined />}
          onClick={async () => {
            console.log(appSecret);

            await hamsteryrefreshLib(appSecret, name)
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
