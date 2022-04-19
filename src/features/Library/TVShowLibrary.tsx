import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Divider, Dropdown, Row } from 'antd';
import React from 'react';
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatus, setAddShowModal } from '../GlobalSlice';
import { LibraryContextMenu } from './LibraryHome';
import { ITVShow, selectTVShowsLibrary } from './LibrarySlice';
import { TVShowCard } from './TVShowCard';

function show_sorter(a: ITVShow, b: ITVShow) {
  const atime = a.firstAirDate ? new Date(a.firstAirDate).getTime() : 0;
  const btime = b.firstAirDate ? new Date(b.firstAirDate).getTime() : 0;
  return btime - atime;
}

export function TVShowLibrary() {
  const { name = '' } = useParams();
  const { appSecret } = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const lib = useAppSelector(selectTVShowsLibrary(name));
  if (!lib)
    return <div></div>
  const showsView = [...lib.shows].sort(show_sorter).map((show, i) => {
    return <Col key={i}><TVShowCard key={show.metaSource.id} libName={name} show={show} /></Col>
  });

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Dropdown overlay={LibraryContextMenu(name, appSecret, dispatch, () => dispatch(setAddShowModal({ visible: true, library: lib })))} trigger={['click', 'contextMenu']}>
            <Link to={`/tvshows/${lib.name}`}>
              <HomeOutlined /> <span>{lib.name}</span>
            </Link>
          </Dropdown>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <Row gutter={24} style={{ margin: 16 }} align='bottom'>
        {showsView}
      </Row>
    </div>
  );
}
