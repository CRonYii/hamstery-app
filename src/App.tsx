import React, { useEffect } from 'react';
import Cookies from 'js-cookie'
import { useAppSelector, useAppDispatch } from './app/hooks';
import { selectStatus, testAuth } from './features/GlobalSlice'
import { LibraryHome } from './features/Library/LibraryHome';
import { Login } from './features/Login/Login';
import './App.css';

const App: React.FC = () => {
  const { authorized } = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const secret = Cookies.get('appSecret');
    if (secret && secret !== '') {
      dispatch(testAuth(secret));
    }
  }, [dispatch]);

  return <div className="App">
    {authorized === true ? <LibraryHome /> : <Login />}
  </div>
};

export default App;
