import React, { useState } from 'react';
import { Button, Input } from 'antd';

import { useAppDispatch } from '../../app/hooks';
import { testAuth } from '../GlobalSlice'

export function Login() {

  const dispatch = useAppDispatch();
  const [appSecret, setAppSecret] = useState('');

  return (
    <div>
      <Input.Password placeholder='App secret'
        value={appSecret}
        onChange={(e) => setAppSecret(e.target.value)}
      />
      <Button onClick={() => dispatch(testAuth(appSecret))}>Go!</Button>
    </div>
  );
}
