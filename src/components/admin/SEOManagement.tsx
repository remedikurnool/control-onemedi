
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Globe, Image, FileText, Save, Eye, Share2 } from 'lucide-react';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

interface SEOConfig {
  site_title: string;
  site_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  twitter_card: string;
  twitter_site: string;
  twitter_creator: string;
  canonical_url: string;
  robots_txt: string;
  sitemap_enabled: boolean;
  google_analytics_id: string;
  google_search_console_id: string;
  facebook_pixel_id: string;
}

const SEOManagement: React.FC = () => {
  const { data: settings, update, isLoading } = useGlobalSettings();
  const [seoConfig, setSeoConfig] = useState<SEOConfig>({
    site_title: 'OneMedi - Complete Healthcare Solutions',
    site_description: 'OneMedi provides comprehensive healthcare services including online medicine delivery, lab tests, doctor consultations, and more. Your health, our priority.',
    meta_keywords: 'online pharmacy, medicine delivery, lab tests, doctor consultation, healthcare, medical services',
    og_title: 'OneMedi - Complete Healthcare Solutions',
    og_description: 'OneMedi provides comprehensive healthcare services including online medicine delivery, lab tests, doctor consultations, and more.',
    og_image: '/og-image.jpg',
    og_url: 'https://onemedi.com',
    twitter_card: 'summary_large_image',
    twitter_site: '@onemedi',
    twitter_creator: '@onemedi',
    canonical_url: 'https://onemedi.com',
    robots_txt: 'User-agent: *\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://onemedi.com/sitemap.xml',
    sitemap_enabled: true,
    google_analytics_id: '',
    google_search_console_id: '',
    facebook_pixel_id: ''
  });

  useEffect(() => {
    if (settings.length > 0) {
      const globalSettings = settings[0];
      if (globalSettings.seo_config) {
        setSeoConfig(globalSettings.seo_config as SEOConfig);
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      if (settings.length > 0) {
        await update(settings[0].id, {
          seo_config: seoConfig
        });
        toast.success('SEO configuration saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save SEO configuration');
    }
  };

  const handleConfigChange = (key: keyof SEOConfig, value: any) => {
    setSeoConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generatePreview = () => {
    return {
      title: seoConfig.site_title,
      description: seoConfig.site_description,
      url: seoConfig.canonical_url
    };
  };

  const preview = generatePreview();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Management</h1>
          <p className="text-muted-foreground">Configure SEO settings and meta tags for better search visibility</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save SEO Settings
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Basic SEO Settings
              </CardTitle>
              <CardDescription>
                Configure essential SEO meta tags and descriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_title">Site Title</Label>
                <Input
                  id="site_title"
                  value={seoConfig.site_title}
                  onChange={(e) => handleConfigChange('site_title', e.target.value)}
                  placeholder="Your site title"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {seoConfig.site_title.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <Label htmlFor="site_description">Meta Description</Label>
                <Textarea
                  id="site_description"
                  value={seoConfig.site_description}
                  onChange={(e) => handleConfigChange('site_description', e.target.value)}
                  placeholder="Brief description of your website"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {seoConfig.site_description.length}/160 characters (optimal: 120-160)
                </p>
              </div>

              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={seoConfig.meta_keywords}
                  onChange={(e) => handleConfigChange('meta_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Comma-separated keywords (5-10 keywords recommended)
                </p>
              </div>

              <div>
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  value={seoConfig.canonical_url}
                  onChange={(e) => handleConfigChange('canonical_url', e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Open Graph (Facebook)
              </CardTitle>
              <CardDescription>
                Configure how your site appears when shared on Facebook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="og_title">OG Title</Label>
                <Input
                  id="og_title"
                  value={seoConfig.og_title}
                  onChange={(e) => handleConfigChange('og_title', e.target.value)}
                  placeholder="Title for social media sharing"
                />
              </div>

              <div>
                <Label htmlFor="og_description">OG Description</Label>
                <Textarea
                  id="og_description"
                  value={seoConfig.og_description}
                  onChange={(e) => handleConfigChange('og_description', e.target.value)}
                  placeholder="Description for social media sharing"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="og_image">OG Image URL</Label>
                <Input
                  id="og_image"
                  value={seoConfig.og_image}
                  onChange={(e) => handleConfigChange('og_image', e.target.value)}
                  placeholder="https://yoursite.com/og-image.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended size: 1200x630 pixels
                </p>
              </div>

              <div>
                <Label htmlFor="og_url">OG URL</Label>
                <Input
                  id="og_url"
                  value={seoConfig.og_url}
                  onChange={(e) => handleConfigChange('og_url', e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Twitter Card Settings</CardTitle>
              <CardDescription>
                Configure how your site appears when shared on Twitter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="twitter_card">Twitter Card Type</Label>
                <Input
                  id="twitter_card"
                  value={seoConfig.twitter_card}
                  onChange={(e) => handleConfigChange('twitter_card', e.target.value)}
                  placeholder="summary_large_image"
                />
              </div>

              <div>
                <Label htmlFor="twitter_site">Twitter Site</Label>
                <Input
                  id="twitter_site"
                  value={seoConfig.twitter_site}
                  onChange={(e) => handleConfigChange('twitter_site', e.target.value)}
                  placeholder="@yoursite"
                />
              </div>

              <div>
                <Label htmlFor="twitter_creator">Twitter Creator</Label>
                <Input
                  id="twitter_creator"
                  value={seoConfig.twitter_creator}
                  onChange={(e) => handleConfigChange('twitter_creator', e.target.value)}
                  placeholder="@creator"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Advanced SEO Settings
              </CardTitle>
              <CardDescription>
                Configure robots.txt, sitemap, and other advanced settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="robots_txt">Robots.txt Content</Label>
                <Textarea
                  id="robots_txt"
                  value={seoConfig.robots_txt}
                  onChange={(e) => handleConfigChange('robots_txt', e.target.value)}
                  placeholder="User-agent: *\nDisallow: /admin/"
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sitemap_enabled"
                  checked={seoConfig.sitemap_enabled}
                  onChange={(e) => handleConfigChange('sitemap_enabled', e.target.checked)}
                />
                <Label htmlFor="sitemap_enabled">Enable XML Sitemap Generation</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>
                Configure Google Analytics, Search Console, and other tracking tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  value={seoConfig.google_analytics_id}
                  onChange={(e) => handleConfigChange('google_analytics_id', e.target.value)}
                  placeholder="GA4-XXXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="google_search_console_id">Google Search Console ID</Label>
                <Input
                  id="google_search_console_id"
                  value={seoConfig.google_search_console_id}
                  onChange={(e) => handleConfigChange('google_search_console_id', e.target.value)}
                  placeholder="google-site-verification=..."
                />
              </div>

              <div>
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  value={seoConfig.facebook_pixel_id}
                  onChange={(e) => handleConfigChange('facebook_pixel_id', e.target.value)}
                  placeholder="1234567890123456"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Search Result Preview
              </CardTitle>
              <CardDescription>
                Preview how your site will appear in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-blue-600 hover:underline cursor-pointer text-lg">
                  {preview.title}
                </div>
                <div className="text-green-700 text-sm mt-1">
                  {preview.url}
                </div>
                <div className="text-gray-600 text-sm mt-2">
                  {preview.description}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Preview</CardTitle>
              <CardDescription>
                Preview how your site will appear when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white max-w-md">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{seoConfig.og_title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{seoConfig.og_description}</p>
                  <p className="text-gray-400 text-xs mt-2 uppercase">{seoConfig.og_url}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
              <CardDescription>
                Basic SEO health check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Title Length</span>
                  <Badge variant={seoConfig.site_title.length <= 60 ? "default" : "destructive"}>
                    {seoConfig.site_title.length <= 60 ? "Good" : "Too Long"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Description Length</span>
                  <Badge variant={seoConfig.site_description.length <= 160 ? "default" : "destructive"}>
                    {seoConfig.site_description.length <= 160 ? "Good" : "Too Long"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Keywords Present</span>
                  <Badge variant={seoConfig.meta_keywords ? "default" : "secondary"}>
                    {seoConfig.meta_keywords ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>OG Tags Present</span>
                  <Badge variant={seoConfig.og_title && seoConfig.og_description ? "default" : "secondary"}>
                    {seoConfig.og_title && seoConfig.og_description ? "Yes" : "Incomplete"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManagement;
