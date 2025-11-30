'use client';
import React from 'react';
import BkOrderForm from '../_child/BkOrderForm';
import AkOrderForm from '../_child/AkOrderForm';
import InsolesOrderForm from '../_child/InsolesOrderForm';
import BEOrderForm from '../_child/BEOrderForm';
import AEOrderForm from '../_child/AEOrderForm';
import NewProductOrderForm from '../_child/NewProductOrderForm'
import CranialForm from '@/app/(pages)/(protected-routes)/orders/new-order/_child/CranialOrderForm';

export default function NewOrderController({
  params
}: {
  params: Promise<{ product: string }>;
}): React.JSX.Element {
  const { product } = React.use(params);

  if (product?.toLowerCase()?.includes('bk')) {
    return <BkOrderForm item_type={product} />;
  } else if (product?.toLowerCase()?.includes('ak')) {
    return <AkOrderForm item_type={product} />

  }
  else if (product?.toLowerCase()?.includes('in')) {
    return <InsolesOrderForm item_type={product} />

  }
  else if (product?.toLowerCase()?.includes('cranial')) {
    return <CranialForm item_type={product} />

  }
  else if (product?.toLowerCase()?.includes('be')) {
    return <BEOrderForm item_type={product} />

  }
  else if (product?.toLowerCase()?.includes('ae')) {
    return <AEOrderForm item_type={product} />

  }
  else if (product?.toLowerCase()?.includes('hkafo')) {
    return <NewProductOrderForm item_type={"cranial"} />

  }
  else {
    return <p>Invalid product</p>;
  }
}
