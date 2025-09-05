import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import baseQuery from './baseQuery'; // Import baseQuery separately
import { toast } from 'react-toastify';

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result: any = await baseQuery(args, api, extraOptions);

  if (result.error) {
    // const { status, data } = result.error;
    // toast.error(result?.error?.data?.message || 'Something went wrong');
    // console.error('Base query error:', result);
  }

  return result;
};

export default baseQueryWithReauth;
