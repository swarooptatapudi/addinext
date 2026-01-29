'use client';

import { useState, useEffect } from 'react';
import { SelectBox } from '@/components/ui/selectbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, CoinsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import {
  useGetAKEstimateMutation,
  useValidateCouponMutation
} from '@/rtk-query/apis/orders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useGetFormSettingsQuery } from '@/rtk-query/apis/forms';

export const Step5AKFinishing = ({
                                   values,
                                   errors,
                                   touched,
                                   setFieldValue,
                                   FORM_OPTIONS,
                                   selectedItem,
                                   isActiveStep,
                                   setEstimateConform,
                                   user,
                                   isViewMode,
                                   setDesgin,
                                   setPrint,
                                   setTotalPrice
                                 }: any) => {
  const [showEstimateCard, setShowEstimateCard] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isEstimateStale, setIsEstimateStale] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [validateCoupon] = useValidateCouponMutation();
  const [getAKEstimate] = useGetAKEstimateMutation();

  const [availableAddicoins, setAvailableAddicoins] = useState<string | null>(null);
  const [requiredAddicoins, setRequiredAddicoins] = useState<string | null>(null);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);

  const { data: formSettings } = useGetFormSettingsQuery('AK');

  const [designOptions, setDesignOptions] = useState<any[]>([]);
  const [printOptions, setPrintOptions] = useState<any[]>([]);

  // ----------------------------------------
  // Load Design / Print options
  // ----------------------------------------
  useEffect(() => {
    if (!formSettings) return;

    const rows = Array.isArray(formSettings)
      ? formSettings
      : formSettings.order_from_details || [];

    const designRow = rows.find((r: any) => r.field_name === 'design_by');
    const printRow = rows.find((r: any) => r.field_name === 'print_by');

    if (designRow?.select_options) {
      const opts = designRow.select_options.split(',').map((v: string) => ({
        value: v.trim(),
        label: v.trim()
      }));
      setDesignOptions(opts);
      if (!values.design_by && opts[0]) setFieldValue('design_by', opts[0].value);
    }

    if (printRow?.select_options) {
      const opts = printRow.select_options.split(',').map((v: string) => ({
        value: v.trim(),
        label: v.trim()
      }));
      setPrintOptions(opts);
      if (!values.print_by && opts[0]) setFieldValue('print_by', opts[0].value);
    }
  }, [formSettings]);

  // ----------------------------------------
  // Estimate
  // ----------------------------------------
  const handleEstimateClick = async () => {
    if (!selectedItem || !selectedItem.startsWith('AK-')) {
      toast.error('Invalid AK item selected');
      return;
    }

    if (!values.design_by || !values.print_by) {
      toast.error('Design by and Print by are required');
      return;
    }

    setIsEstimating(true);

    const payload = {
      item_code: selectedItem,
      design_by: values.design_by,
      print_by: values.print_by,
      discount_per: couponData?.discount_percentage ?? 0,
      discount_amt: couponData?.discount_amount ?? 0,
      coupon_code: couponCode.trim() || undefined
    };

    try {
      const res = await getAKEstimate(payload).unwrap();

      // ✅ AK always returns data under message.data
      const data = res?.message?.data;
      if (!data) {
        throw new Error('Invalid estimate response');
      }

      // ✅ Safe assignments
      setDesgin(data.design ?? '0');
      setPrint(data.print ?? '0');
      setTotalPrice(data.total_price ?? '0');

      setAvailableAddicoins(data.customer_available_coins ?? null);
      setRequiredAddicoins(data.design_coin_use ?? null);

      // ✅ SAFE numeric parsing
      const available = parseFloat(
        (data.customer_available_coins ?? '0').replace(/,/g, '')
      );
      const required = parseFloat(
        (data.design_coin_use ?? '0').replace(/,/g, '')
      );

      if (values.design_by === 'Self' && available < required) {
        setShowInsufficientCoinsModal(true);
        return;
      }

      setEstimateData(data);
      setShowEstimateCard(true);
      setIsEstimateStale(false);

    } catch (e: any) {
      toast.error(
        e?.data?.message ||
        e?.message ||
        'Estimate failed'
      );
    } finally {
      setIsEstimating(false);
    }
  };

    // ----------------------------------------
  // Coupon
  // ----------------------------------------
  const validateCouponHandler = async () => {
    if (!couponCode || couponCode.length < 5) return;
    try {
      const res = await validateCoupon({ coupon_code: couponCode }).unwrap();
      setCouponData(res.message);
    } catch {
      setCouponData(null);
    }
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-primary">Design & Printing</h3>

        <div className="mt-5 space-y-4">
          <SelectBox
            options={designOptions}
            value={values.design_by}
            onValueChange={(v) => {
              setFieldValue('design_by', v);
              setEstimateConform(false);
            }}
            disabled={isViewMode}
          />

          <SelectBox
            options={printOptions}
            value={values.print_by}
            onValueChange={(v) => {
              setFieldValue('print_by', v);
              setEstimateConform(false);
            }}
            disabled={isViewMode}
          />

          <Input
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onBlur={validateCouponHandler}
          />

          <Button onClick={handleEstimateClick} disabled={isEstimating}>
            {isEstimating ? 'Estimating…' : 'Estimate Now'}
          </Button>

          {showEstimateCard && estimateData && (
            <Card>
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>₹{estimateData.total_price}</span>
                </div>
                <div className="mt-3">
                  <input
                    type="checkbox"
                    onChange={(e) => setEstimateConform(e.target.checked)}
                  />{' '}
                  I agree to terms
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showInsufficientCoinsModal && (
        <Dialog open onOpenChange={setShowInsufficientCoinsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insufficient Addicoins</DialogTitle>
            </DialogHeader>
            <p>Not enough Addicoins to proceed.</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
