
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Target, 
  Mail, 
  Gift, 
  Star, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Zap,
  Users,
  ShoppingCart,
  Award
} from 'lucide-react';

interface DynamicPricingRule {
  id: string;
  rule_name: string;
  rule_type: string;
  target_products: any[];
  conditions: any;
  adjustments: any;
  priority: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

interface RecommendationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  trigger_products: any[];
  recommended_products: any[];
  conditions: any;
  discount_percentage: number;
  priority: number;
  is_active: boolean;
}

interface AbandonedCartCampaign {
  id: string;
  campaign_name: string;
  trigger_delay_minutes: number;
  email_template: string | null;
  sms_template: string | null;
  whatsapp_template: string | null;
  discount_code: string | null;
  discount_percentage: number;
  follow_up_sequence: any[];
  is_active: boolean;
}

interface LoyaltyProgram {
  id: string;
  program_name: string;
  points_per_rupee: number;
  referral_points: number;
  birthday_bonus_points: number;
  tier_thresholds: any;
  tier_benefits: any;
  point_expiry_months: number;
  min_redemption_points: number;
  redemption_rate: number;
  is_active: boolean;
}

interface LimitedTimeOffer {
  id: string;
  offer_name: string;
  offer_type: string;
  applicable_products: any[];
  applicable_categories: any[];
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  minimum_order_amount: number;
  usage_limit: number | null;
  usage_count: number;
  start_time: string;
  end_time: string;
  urgency_message: string | null;
  banner_image_url: string | null;
  is_active: boolean;
}

interface MarketingManagementProps {
  onOpenForm: (formType: string, item?: any) => void;
}

const MarketingManagement: React.FC<MarketingManagementProps> = ({ onOpenForm }) => {
  const [activeTab, setActiveTab] = useState('pricing');
  const queryClient = useQueryClient();

  // Fetch dynamic pricing rules
  const { data: pricingRules = [], isLoading: pricingLoading } = useQuery({
    queryKey: ['dynamic-pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dynamic_pricing_rules')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as DynamicPricingRule[];
    }
  });

  // Fetch recommendation rules
  const { data: recommendationRules = [], isLoading: recommendationLoading } = useQuery({
    queryKey: ['recommendation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommendation_rules')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as RecommendationRule[];
    }
  });

  // Fetch abandoned cart campaigns
  const { data: cartCampaigns = [], isLoading: cartLoading } = useQuery({
    queryKey: ['abandoned-cart-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abandoned_cart_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AbandonedCartCampaign[];
    }
  });

  // Fetch loyalty program config
  const { data: loyaltyProgram, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['loyalty-program-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_program_config')
        .select('*')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as LoyaltyProgram | null;
    }
  });

  // Fetch limited time offers
  const { data: limitedOffers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['limited-time-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_time_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LimitedTimeOffer[];
    }
  });

  // Fetch product reviews
  const { data: productReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, products(name_en)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Delete mutations
  const deletePricingRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dynamic_pricing_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pricing-rules'] });
      toast.success('Pricing rule deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete pricing rule');
      console.error(error);
    }
  });

  const renderPricingRules = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Dynamic Pricing Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic pricing adjustments based on demand, inventory, and customer tiers
          </p>
        </div>
        <Button onClick={() => onOpenForm('pricing')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {pricingRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{rule.rule_type}</Badge>
                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('pricing', rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePricingRule.mutate(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium">Target Products</Label>
                  <p className="text-muted-foreground">
                    {rule.target_products.length > 0 ? `${rule.target_products.length} selected` : 'All products'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">Valid Period</Label>
                  <p className="text-muted-foreground">
                    {rule.valid_from && rule.valid_until 
                      ? `${new Date(rule.valid_from).toLocaleDateString()} - ${new Date(rule.valid_until).toLocaleDateString()}`
                      : 'Always active'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Recommendation Engine</h3>
          <p className="text-sm text-muted-foreground">
            Configure cross-selling and upselling recommendations
          </p>
        </div>
        <Button onClick={() => onOpenForm('recommendations')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {recommendationRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{rule.rule_type}</Badge>
                    {rule.discount_percentage > 0 && (
                      <Badge variant="outline">{rule.discount_percentage}% discount</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('recommendations', rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Delete logic */}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium">Trigger Products</Label>
                  <p className="text-muted-foreground">
                    {rule.trigger_products.length} products
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">Recommended Products</Label>
                  <p className="text-muted-foreground">
                    {rule.recommended_products.length} products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAbandonedCart = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Abandoned Cart Recovery</h3>
          <p className="text-sm text-muted-foreground">
            Setup automated email, SMS, and WhatsApp campaigns for cart recovery
          </p>
        </div>
        <Button onClick={() => onOpenForm('campaign')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {cartCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{campaign.campaign_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Trigger: {campaign.trigger_delay_minutes}min
                    </Badge>
                    {campaign.discount_percentage > 0 && (
                      <Badge variant="outline">{campaign.discount_percentage}% off</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('campaign', campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Delete logic */}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium">Email Template</Label>
                  <p className="text-muted-foreground">
                    {campaign.email_template ? 'Active' : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">SMS Template</Label>
                  <p className="text-muted-foreground">
                    {campaign.sms_template ? 'Active' : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">WhatsApp Template</Label>
                  <p className="text-muted-foreground">
                    {campaign.whatsapp_template ? 'Active' : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLoyaltyProgram = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Loyalty Program</h3>
          <p className="text-sm text-muted-foreground">
            Configure points, rewards, and tier management
          </p>
        </div>
        <Button onClick={() => onOpenForm('loyalty')}>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {loyaltyProgram && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {loyaltyProgram.program_name}
              <Badge variant={loyaltyProgram.is_active ? 'default' : 'secondary'}>
                {loyaltyProgram.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs font-medium">Points per ₹</Label>
                <p className="text-2xl font-bold">{loyaltyProgram.points_per_rupee}</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Referral Points</Label>
                <p className="text-2xl font-bold">{loyaltyProgram.referral_points}</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Birthday Bonus</Label>
                <p className="text-2xl font-bold">{loyaltyProgram.birthday_bonus_points}</p>
              </div>
              <div>
                <Label className="text-xs font-medium">Point Expiry</Label>
                <p className="text-2xl font-bold">{loyaltyProgram.point_expiry_months}mo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
          <p className="text-sm text-muted-foreground">
            Manage product reviews and social proof
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {productReviews.slice(0, 10).map((review: any) => (
          <Card key={review.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{review.products?.name_en}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                    {review.is_verified_purchase && (
                      <Badge variant="outline">Verified Purchase</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenForm('review', review)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {review.review_title && (
                  <h4 className="font-medium">{review.review_title}</h4>
                )}
                {review.review_text && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {review.review_text}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  <span>{review.helpful_count} helpful</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLimitedOffers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Limited Time Offers</h3>
          <p className="text-sm text-muted-foreground">
            Create flash sales and urgent promotions with countdown timers
          </p>
        </div>
        <Button onClick={() => onOpenForm('offer')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Offer
        </Button>
      </div>

      <div className="grid gap-4">
        {limitedOffers.map((offer) => {
          const now = new Date();
          const startTime = new Date(offer.start_time);
          const endTime = new Date(offer.end_time);
          const isActive = now >= startTime && now <= endTime && offer.is_active;
          const isUpcoming = now < startTime;
          const isExpired = now > endTime;

          return (
            <Card key={offer.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {offer.offer_name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={
                        isActive ? 'default' : 
                        isUpcoming ? 'secondary' : 
                        isExpired ? 'destructive' : 'outline'
                      }>
                        {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Expired'}
                      </Badge>
                      <Badge variant="outline">{offer.offer_type}</Badge>
                      <Badge variant="outline">
                        {offer.discount_value}{offer.discount_type === 'percentage' ? '%' : '₹'} off
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenForm('offer', offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Delete logic */}}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-medium">Duration</Label>
                    <p className="text-muted-foreground">
                      {startTime.toLocaleDateString()} - {endTime.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Usage</Label>
                    <p className="text-muted-foreground">
                      {offer.usage_count} / {offer.usage_limit || '∞'} used
                    </p>
                  </div>
                </div>
                {offer.urgency_message && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                    {offer.urgency_message}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Sales</h1>
          <p className="text-muted-foreground">
            Comprehensive sales conversion and marketing automation tools
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="abandoned-cart" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Cart Recovery
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          {renderPricingRules()}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {renderRecommendations()}
        </TabsContent>

        <TabsContent value="abandoned-cart" className="space-y-6">
          {renderAbandonedCart()}
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          {renderLoyaltyProgram()}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {renderReviews()}
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          {renderLimitedOffers()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingManagement;
