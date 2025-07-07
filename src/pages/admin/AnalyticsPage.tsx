
import AdvancedAnalytics from '@/components/admin/AdvancedAnalytics';

const AnalyticsPage = () => {
  const handleOpenForm = (formType: string, item?: any) => {
    console.log('Opening form:', formType, item);
    // In real implementation, this would open the appropriate form/modal
  };

  return <AdvancedAnalytics onOpenForm={handleOpenForm} />;
};

export default AnalyticsPage;
