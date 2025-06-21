'use client';
import { store } from '@/rtk-query/store';
import React from 'react';
import { Provider } from 'react-redux';
function layout({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export default layout;