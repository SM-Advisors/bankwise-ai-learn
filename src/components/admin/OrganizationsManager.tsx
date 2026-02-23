import { useState } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useToast } from '@/hooks/use-toast';
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
    updateOrgModels,
  } = useOrganizations();

  const [savingModelsOrgId, setSavingModelsOrgId] = useState<string | null>(null);

  // Inline edit usage state
  const [editingUsageId, setEditingUsageId] = useState<string | null>(null);
  const [editUsageValue, setEditUsageValue] = useState('');

  // Create org form state
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

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

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      toast({ title: 'Missing fields', description: 'Organization name is required.', variant: 'destructive' });
      return;
    }
    setCreatingOrg(true);
    const result = await createOrganization(orgName.trim(), orgSlug.trim());
    setCreatingOrg(false);
    if (result.success) {
      toast({ title: 'Organization created', description: `"${orgName}" has been added.` });
      setOrgName('');
      setOrgSlug('');
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to create organization.', variant: 'destructive' });
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(org.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="Acme Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug (auto-generated)</Label>
                <Input
                  id="org-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="acme-bank"
                  className="font-mono text-sm"
                />
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
                    {savingModelsOrgId === org.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
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
                        {editingUsageId === rc.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              value={editUsageValue}
                              onChange={(e) => setEditUsageValue(e.target.value)}
                              className="w-16 h-7 text-center text-sm"
                            />
                            <span className="text-muted-foreground">{rc.max_uses != null ? ` / ${rc.max_uses}` : ''}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveUsage(rc.id)}>
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingUsageId(null)}>
                              <X className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handleStartEditUsage(rc.id, rc.current_uses)}
                            title="Click to edit usage"
                          >
                            {rc.current_uses}{rc.max_uses != null ? ` / ${rc.max_uses}` : ' / --'}
                            <Pencil className="h-3 w-3 opacity-50" />
                          </button>
                        )}
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
