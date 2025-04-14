import React from 'react';
import BkOrderForm from '../_child/BkOrderForm';
import AkOrderForm from '../_child/AkOrderForm';

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
  else {
    return <p>Invalid product</p>;
  }
}
