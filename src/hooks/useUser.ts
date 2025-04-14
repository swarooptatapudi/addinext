'use client';

import { useLazyGetUserDetailsQuery } from '@/rtk-query/apis/auth';
import { updateUser } from '@/rtk-query/slices/auth.slice';
import { RootState } from '@/rtk-query/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useUser = () => {
  const [getUser, { data, isLoading, isSuccess }] = useLazyGetUserDetailsQuery();
  const { user } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!user) {
      getUser('');
    }
  }, []);
  useEffect(() => {
    if (isSuccess && !isLoading) {
      dispatch(updateUser(data?.data));
    }
  }, [isSuccess, isLoading]);

  return { user, isLoading, getUser };
};

export default useUser;
