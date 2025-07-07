
import React, { useState } from 'react';
import MarketingManagement from './MarketingManagement';
import DynamicPricingForm from './DynamicPricingForm';
import LimitedOfferForm from './LimitedOfferForm';
import AbandonedCartCampaignForm from './AbandonedCartCampaignForm';

const SalesConversionManager = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenForm = (formType: string, item?: any) => {
    setActiveForm(formType);
    setEditingItem(item || null);
  };

  const handleCloseForm = () => {
    setActiveForm(null);
    setEditingItem(null);
  };

  return (
    <>
      <MarketingManagement onOpenForm={handleOpenForm} />
      
      <DynamicPricingForm
        open={activeForm === 'pricing'}
        onOpenChange={(open) => !open && handleCloseForm()}
        editingRule={editingItem}
      />
      
      <LimitedOfferForm
        open={activeForm === 'offer'}
        onOpenChange={(open) => !open && handleCloseForm()}
        editingOffer={editingItem}
      />
      
      <AbandonedCartCampaignForm
        open={activeForm === 'campaign'}
        onOpenChange={(open) => !open && handleCloseForm()}
        editingCampaign={editingItem}
      />
    </>
  );
};

export default SalesConversionManager;
