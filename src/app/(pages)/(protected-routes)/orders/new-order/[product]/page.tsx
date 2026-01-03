'use client';
import React from 'react';
import BkOrderForm from '../_child/BkOrderForm';
import AkOrderForm from '../_child/AkOrderForm';
import InsolesOrderForm from '../_child/InsolesOrderForm';
import BEOrderForm from '../_child/BEOrderForm';
import AEOrderForm from '../_child/AEOrderForm';
import HkafoAndKafoForm from '../_child/HkaforAndKafoForm'
import CranialForm from '@/app/(pages)/(protected-routes)/orders/new-order/_child/CranialOrderForm';
import ASPOrderForm from '../_child/ASPOrderForm';
import ASEPOrderForm from '../_child/ASEPOrderForm';
import ASEPAOrderForm from '../_child/ASEPAOrderForm';
import HelmetOrderEntryPage from '@/app/(pages)/(protected-routes)/orders/new-order/_child/HelmetOrderEntryPage';
import AFOOrderForm from '../_child/AFOOrderForm';

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
    return <HkafoAndKafoForm item_type={"cranial"} />

  }
  else if (product?.toLowerCase()==='addishieldplus') {
    return <HelmetOrderEntryPage />
  }
  else if (product?.toLowerCase()?.includes('afo')) {
    return <AFOOrderForm item_type={product} />

  }
  /*else if (product?.toLowerCase()?.includes('asep')) {
    return <ASEPOrderForm item_type={product} />
  }
  else if (product?.toLowerCase()?.includes('asp')) {
    return <ASPOrderForm item_type={product} />
  }*/
  else {
    return <p>Invalid product</p>;
  }
}
