'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Volume2, Loader2, Check, Palette, CreditCard, BarChart3, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Voice {
  id: string;
  friendly_name: string;
  type: string;
  sample_text: string;
  audio_url: string;
}

interface Settings {
  dark_mode: boolean;
  ai_voice_id: string;
}

interface AIUsage {
  current_week: {
    week_start: string;
    total_tokens: number;
    total_requests: number;
    chat_tokens: number;
    voice_tokens: number;
    image_tokens: number;
    percentage_used: number;
  };
  limits: {
    weekly_limit: number;
    reset_day: number;
    days_until_reset: number;
  };
  history: Array<{
    week_start: string;
    total_tokens: number;
    total_requests: number;
    chat_tokens: number;
    voice_tokens: number;
    image_tokens: number;
  }>;
}

type SettingsSection = 'appearance' | 'ai-voice' | 'ai-usage' | 'billing';

const navigationItems = [
  { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette },
  { id: 'ai-voice' as SettingsSection, label: 'AI Voice', icon: Volume2 },
  { id: 'ai-usage' as SettingsSection, label: 'AI Usage', icon: BarChart3 },
  { id: 'billing' as SettingsSection, label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    dark_mode: false,
    ai_voice_id: 'af'
  });

  useEffect(() => {
    fetchSettings();
    fetchVoices();
  }, []);

  useEffect(() => {
    if (activeSection === 'ai-usage') {
      fetchAIUsage();
    }
  }, [activeSection]);

  const fetchSettings = async () => {
    try {
      console.log('[Client] Fetching settings from /api/settings');
      
      const response = await fetch('/api/settings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSettings(data);
      setFormData({
        dark_mode: data.dark_mode || false,
        ai_voice_id: data.ai_voice_id || 'af'
      });
    } catch (error) {
      console.error('[Client] Error fetching settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/settings/voices', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      const data = await response.json();
      setVoices(data.voices);
    } catch (error) {
      console.error('[Client] Error fetching voices:', error);
    }
  };

  const fetchAIUsage = async () => {
    try {
      setLoadingUsage(true);
      console.log('[Client] Fetching AI usage from /api/settings/ai-usage');
      
      const response = await fetch('/api/settings/ai-usage', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI usage');
      }
      
      const data = await response.json();
      console.log('[Client] AI usage data:', data);
      setAiUsage(data);
    } catch (error) {
      console.error('[Client] Error fetching AI usage:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI usage data',
        variant: 'destructive'
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  const playVoiceSample = (voice: Voice) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPlayingVoice(voice.id);

    const audio = new Audio(voice.audio_url);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingVoice(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setPlayingVoice(null);
      audioRef.current = null;
      toast({
        title: 'Error',
        description: 'Failed to play voice sample',
        variant: 'destructive'
      });
    };

    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayingVoice(null);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status}`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      
      toast({
        title: 'Success',
        description: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('[Client] Error updating settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Group voices by type
  const groupedVoices = voices.reduce((acc, voice) => {
    if (!acc[voice.type]) {
      acc[voice.type] = [];
    }
    acc[voice.type].push(voice);
    return acc;
  }, {} as Record<string, Voice[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Side Navigation */}
      <aside className="w-64 border-r bg-background p-6 space-y-1">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl space-y-8">
            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Appearance</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize how Weeble looks on your device
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {formData.dark_mode ? (
                          <Moon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Sun className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <Label htmlFor="dark_mode" className="text-base font-medium">
                            Dark Mode
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Use dark theme for reduced eye strain
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="dark_mode"
                        checked={formData.dark_mode}
                        onCheckedChange={(checked) => setFormData({ ...formData, dark_mode: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* AI Voice Section */}
            {activeSection === 'ai-voice' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">AI Assistant Voice</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the voice for your AI learning assistant
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={formData.ai_voice_id}
                      onValueChange={(value) => setFormData({ ...formData, ai_voice_id: value })}
                    >
                      {Object.entries(groupedVoices).map(([type, voiceList]) => (
                        <div key={type} className="space-y-3 mb-6 last:mb-0">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {type}
                          </h4>
                          <div className="space-y-2">
                            {voiceList.map((voice) => (
                              <div
                                key={voice.id}
                                className={cn(
                                  'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                                  formData.ai_voice_id === voice.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                )}
                              >
                                <RadioGroupItem value={voice.id} id={voice.id} />
                                <Label
                                  htmlFor={voice.id}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{voice.friendly_name}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {voice.sample_text}
                                  </div>
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => playVoiceSample(voice)}
                                  disabled={playingVoice === voice.id}
                                >
                                  {playingVoice === voice.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Playing
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="h-4 w-4 mr-2" />
                                      Preview
                                    </>
                                  )}
                                </Button>
                                {formData.ai_voice_id === voice.id && (
                                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* AI Usage Section */}
            {activeSection === 'ai-usage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">AI Usage</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your AI assistant usage and manage weekly limits
                  </p>
                </div>

                {loadingUsage ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span className="text-muted-foreground">Loading usage data...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : aiUsage ? (
                  <>
                    {/* Current Week Usage */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          Current Week Usage
                        </CardTitle>
                        <CardDescription>
                          Week starting {formatDate(aiUsage.current_week.week_start)} • Resets in {aiUsage.limits.days_until_reset} {aiUsage.limits.days_until_reset === 1 ? 'day' : 'days'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {formatNumber(aiUsage.current_week.total_tokens)} / {formatNumber(aiUsage.limits.weekly_limit)} tokens
                            </span>
                            <span className="text-muted-foreground">
                              {aiUsage.current_week.percentage_used}% used
                            </span>
                          </div>
                          <Progress value={aiUsage.current_week.percentage_used} className="h-2" />
                        </div>

                        {/* Usage Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Chat Tokens</p>
                            <p className="text-2xl font-bold mt-1">{formatNumber(aiUsage.current_week.chat_tokens)}</p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Voice Tokens</p>
                            <p className="text-2xl font-bold mt-1">{formatNumber(aiUsage.current_week.voice_tokens)}</p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Image Tokens</p>
                            <p className="text-2xl font-bold mt-1">{formatNumber(aiUsage.current_week.image_tokens)}</p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                            <p className="text-2xl font-bold mt-1">{formatNumber(aiUsage.current_week.total_requests)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Usage History */}
                    {aiUsage.history.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Usage History</CardTitle>
                          <CardDescription>Past weekly usage statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {aiUsage.history.map((week, index) => (
                              <div
                                key={week.week_start}
                                className="flex items-center justify-between p-4 rounded-lg border"
                              >
                                <div>
                                  <p className="font-medium">
                                    Week of {formatDate(week.week_start)}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {formatNumber(week.total_requests)} requests
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">
                                    {formatNumber(week.total_tokens)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">tokens</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground py-8">
                        No usage data available
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Billing</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription and billing information
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Billing settings coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}