import { useState } from 'react';
import { useOrganizations, type OrgPlatformType } from '@/hooks/useOrganizations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ENTERPRISE_INDUSTRIES, CONSUMER_INDUSTRIES, type AudienceType } from '@/data/industryConfigs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Key, Plus, Loader2, RefreshCw, Pencil, Check, X, Cpu } from 'lucide-react';
import { AVAILABLE_MODELS, PROVIDER_COLORS } from '@/lib/models';

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function OrganizationsManager() {
  const { toast } = useToast();
  const {
    organizations,
    registrationCodes,
    loading,
    refetch,
    createOrganization,
    createRegistrationCode,
    toggleCodeActive,
    updateCodeUses,
    updateCodeMaxUses,
    updateOrgModels,
    updateOrgPlatform,
  } = useOrganizations();

  const [savingModelsOrgId, setSavingModelsOrgId] = useState<string | null>(null);

  // Inline edit usage state
  const [editingUsageId, setEditingUsageId] = useState<string | null>(null);
  const [editUsageValue, setEditUsageValue] = useState('');

  // Inline edit max uses state
  const [editingMaxUsesId, setEditingMaxUsesId] = useState<string | null>(null);
  const [editMaxUsesValue, setEditMaxUsesValue] = useState('');

  // Create org form state
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgAudienceType, setOrgAudienceType] = useState<AudienceType>('enterprise');
  const [orgIndustry, setOrgIndustry] = useState('banking');
  const [orgPlatform, setOrgPlatform] = useState<OrgPlatformType>('default');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [regeneratingOrgId, setRegeneratingOrgId] = useState<string | null>(null);

  // Create code form state
  const [codeString, setCodeString] = useState('');
  const [codeOrgId, setCodeOrgId] = useState('');
  const [codeExpiry, setCodeExpiry] = useState('');
  const [codeMaxUses, setCodeMaxUses] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    setOrgSlug(toSlug(value));
  };

  const handleAudienceTypeChange = (value: AudienceType) => {
    setOrgAudienceType(value);
    // Reset industry to first option for the new audience type
    if (value === 'enterprise') setOrgIndustry('banking');
    else setOrgIndustry('general');
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      toast({ title: 'Missing fields', description: 'Organization name is required.', variant: 'destructive' });
      return;
    }
    setCreatingOrg(true);
    const result = await createOrganization(orgName.trim(), orgSlug.trim(), orgAudienceType, orgIndustry, orgPlatform);
    setCreatingOrg(false);
    if (result.success) {
      toast({ title: 'Organization created', description: `"${orgName}" has been added.` });
      setOrgName('');
      setOrgSlug('');
      setOrgAudienceType('enterprise');
      setOrgIndustry('banking');
      setOrgPlatform('default');
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to create organization.', variant: 'destructive' });
    }
  };

  const handleRegenerateContent = async (orgId: string, orgName: string) => {
    setRegeneratingOrgId(orgId);
    try {
      const { error } = await (supabase as any)
        .from(\'generated_module_content\')
        .delete()
        .eq('org_id', orgId);
      if (error) throw error;
      toast({ title: 'Content cache cleared', description: `Generated content for "${orgName}" has been cleared. It will regenerate when learners next access modules.` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to clear content cache.', variant: 'destructive' });
    } finally {
      setRegeneratingOrgId(null);
    }
  };

  const handleCreateCode = async () => {
    if (!codeString.trim() || !codeOrgId) {
      toast({ title: 'Missing fields', description: 'Code and organization are required.', variant: 'destructive' });
      return;
    }
    setCreatingCode(true);
    const result = await createRegistrationCode({
      code: codeString.trim().toUpperCase(),
      organization_id: codeOrgId,
      expires_at: codeExpiry || null,
      max_uses: codeMaxUses ? parseInt(codeMaxUses, 10) : null,
    });
    setCreatingCode(false);
    if (result.success) {
      toast({ title: 'Registration code created', description: `Code "${codeString.toUpperCase()}" is now active.` });
      setCodeString('');
      setCodeOrgId('');
      setCodeExpiry('');
      setCodeMaxUses('');
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to create code.', variant: 'destructive' });
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    const result = await toggleCodeActive(codeId, isActive);
    if (result.success) {
      toast({ title: isActive ? 'Code activated' : 'Code deactivated' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to update code.', variant: 'destructive' });
    }
  };

  const handleStartEditUsage = (codeId: string, currentUses: number) => {
    setEditingUsageId(codeId);
    setEditUsageValue(String(currentUses));
  };

  const handleSaveUsage = async (codeId: string) => {
    const value = parseInt(editUsageValue, 10);
    if (isNaN(value) || value < 0) {
      toast({ title: 'Invalid value', description: 'Usage must be a non-negative number.', variant: 'destructive' });
      return;
    }
    const result = await updateCodeUses(codeId, value);
    if (result.success) {
      toast({ title: 'Usage updated' });
      setEditingUsageId(null);
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to update usage.', variant: 'destructive' });
    }
  };

  const handleStartEditMaxUses = (codeId: string, maxUses: number | null) => {
    setEditingMaxUsesId(codeId);
    setEditMaxUsesValue(maxUses != null ? String(maxUses) : '');
  };

  const handleSaveMaxUses = async (codeId: string) => {
    const trimmed = editMaxUsesValue.trim();
    const value = trimmed === '' ? null : parseInt(trimmed, 10);
    if (value !== null && (isNaN(value) || value < 1)) {
      toast({ title: 'Invalid value', description: 'Max uses must be a positive number or empty for unlimited.', variant: 'destructive' });
      return;
    }
    const result = await updateCodeMaxUses(codeId, value);
    if (result.success) {
      toast({ title: 'Max uses updated' });
      setEditingMaxUsesId(null);
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to update max uses.', variant: 'destructive' });
    }
  };

  const handleToggleOrgModel = async (orgId: string, modelId: string, currentModels: string[], enabled: boolean) => {
    const next = enabled
      ? [...new Set([...currentModels, modelId])]
      : currentModels.filter(m => m !== modelId);
    // Always keep at least one model
    if (next.length === 0) {
      toast({ title: 'At least one model required', description: 'Cannot disable all models.', variant: 'destructive' });
      return;
    }
    setSavingModelsOrgId(orgId);
    const result = await updateOrgModels(orgId, next);
    setSavingModelsOrgId(null);
    if (!result.success) {
      toast({ title: 'Error', description: result.error || 'Failed to save model settings.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Section 1: Organizations                                            */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organizations
              </CardTitle>
              <CardDescription>
                Manage organizations that users can be associated with via registration codes
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Org list */}
          {organizations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No organizations yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <Card key={org.id} className="border">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{org.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <Badge variant={org.audience_type === 'consumer' ? 'secondary' : 'outline'} className="text-xs capitalize">
                            {org.audience_type}
                          </Badge>
                          {org.industry && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {org.industry}
                            </Badge>
                          )}
                          <Badge
                            variant={org.platform === 'chatgpt' ? 'default' : 'outline'}
                            className={`text-xs cursor-pointer ${org.platform === 'chatgpt' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-muted'}`}
                            onClick={async () => {
                              const next = org.platform === 'chatgpt' ? 'default' : 'chatgpt';
                              const result = await updateOrgPlatform(org.id, next);
                              if (result.success) {
                                toast({ title: 'Platform updated', description: `Set to ${next === 'chatgpt' ? 'ChatGPT' : 'Default'} UI` });
                              } else {
                                toast({ title: 'Error', description: result.error || 'Failed to update platform', variant: 'destructive' });
                              }
                            }}
                            title="Click to toggle platform"
                          >
                            {org.platform === 'chatgpt' ? 'ChatGPT UI' : 'Default UI'}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {new Date(org.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs w-full"
                      disabled={regeneratingOrgId === org.id}
                      onClick={() => handleRegenerateContent(org.id, org.name)}
                    >
                      {regeneratingOrgId === org.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Regenerate Content
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create org form */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug (auto-generated)</Label>
                <Input
                  id="org-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="acme-corp"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-audience">Audience Type</Label>
                <Select value={orgAudienceType} onValueChange={(v) => handleAudienceTypeChange(v as AudienceType)}>
                  <SelectTrigger id="org-audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="enterprise">Enterprise (B2B)</SelectItem>
                    <SelectItem value="consumer">Consumer (B2C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry / Sector</Label>
                <Select value={orgIndustry} onValueChange={setOrgIndustry}>
                  <SelectTrigger id="org-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {(orgAudienceType === 'enterprise' ? ENTERPRISE_INDUSTRIES : CONSUMER_INDUSTRIES).map((cfg) => (
                      <SelectItem key={cfg.slug} value={cfg.slug}>{cfg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-platform">Training UI</Label>
                <Select value={orgPlatform} onValueChange={(v) => setOrgPlatform(v as OrgPlatformType)}>
                  <SelectTrigger id="org-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateOrg} disabled={creatingOrg} className="gap-2">
                  {creatingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Section 2: AI Models per Organization                               */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            AI Models
          </CardTitle>
          <CardDescription>
            Control which AI models are available to each organization's users in the practice chat. Defaults to Claude Sonnet 4.6 only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No organizations yet.</p>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {savingModelsOrgId === org.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {org.allowed_models.length === AVAILABLE_MODELS.length ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          disabled={savingModelsOrgId === org.id}
                          onClick={() => updateOrgModels(org.id, ['claude-sonnet-4-6']).then(r => { if (!r.success) toast({ title: 'Error', description: r.error, variant: 'destructive' }); })}
                        >
                          Deselect All
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          disabled={savingModelsOrgId === org.id}
                          onClick={() => updateOrgModels(org.id, AVAILABLE_MODELS.map(m => m.id)).then(r => { if (!r.success) toast({ title: 'Error', description: r.error, variant: 'destructive' }); })}
                        >
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {AVAILABLE_MODELS.map((model) => {
                      const enabled = org.allowed_models.includes(model.id);
                      return (
                        <label
                          key={model.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            enabled ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-primary"
                            checked={enabled}
                            onChange={(e) => handleToggleOrgModel(org.id, model.id, org.allowed_models, e.target.checked)}
                            disabled={savingModelsOrgId === org.id}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${PROVIDER_COLORS[model.provider]}`}>
                                {model.provider.toUpperCase().slice(0, 4)}
                              </span>
                              <span className="text-xs font-medium truncate">{model.label}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">{model.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Section 3: Registration Codes                                       */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Registration Codes
          </CardTitle>
          <CardDescription>
            Codes users enter during registration to associate with an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Codes table */}
          {registrationCodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No registration codes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationCodes.map((rc) => (
                    <TableRow key={rc.id}>
                      <TableCell>
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{rc.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rc.organization_name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rc.expires_at
                          ? new Date(rc.expires_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex items-center justify-center gap-1">
                          {/* Current uses - inline editable */}
                          {editingUsageId === rc.id ? (
                            <>
                              <Input
                                type="number"
                                min="0"
                                value={editUsageValue}
                                onChange={(e) => setEditUsageValue(e.target.value)}
                                className="w-16 h-7 text-center text-sm"
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveUsage(rc.id)}>
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingUsageId(null)}>
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => handleStartEditUsage(rc.id, rc.current_uses)}
                              title="Click to edit current usage"
                            >
                              {rc.current_uses}
                              <Pencil className="h-3 w-3 opacity-50" />
                            </button>
                          )}

                          <span className="text-muted-foreground">/</span>

                          {/* Max uses - inline editable */}
                          {editingMaxUsesId === rc.id ? (
                            <>
                              <Input
                                type="number"
                                min="1"
                                value={editMaxUsesValue}
                                onChange={(e) => setEditMaxUsesValue(e.target.value)}
                                className="w-16 h-7 text-center text-sm"
                                placeholder="∞"
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveMaxUses(rc.id)}>
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingMaxUsesId(null)}>
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <button
                              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                              onClick={() => handleStartEditMaxUses(rc.id, rc.max_uses)}
                              title="Click to edit max uses"
                            >
                              {rc.max_uses != null ? rc.max_uses : '∞'}
                              <Pencil className="h-3 w-3 opacity-50" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={rc.is_active}
                          onCheckedChange={(checked) => handleToggleCode(rc.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(rc.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Create code form */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Registration Code
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="code-org">Organization</Label>
                <Select value={codeOrgId} onValueChange={setCodeOrgId}>
                  <SelectTrigger id="code-org">
                    <SelectValue placeholder="Select org" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code-string">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code-string"
                    value={codeString}
                    onChange={(e) => setCodeString(e.target.value.toUpperCase())}
                    placeholder="ABC12345"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCodeString(generateCode())}
                    title="Auto-generate code"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code-expiry">Expiry Date (optional)</Label>
                <Input
                  id="code-expiry"
                  type="date"
                  value={codeExpiry}
                  onChange={(e) => setCodeExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code-max">Max Uses (optional)</Label>
                <Input
                  id="code-max"
                  type="number"
                  min="1"
                  value={codeMaxUses}
                  onChange={(e) => setCodeMaxUses(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateCode} disabled={creatingCode} className="gap-2">
                  {creatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Code
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
