import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, ArrowLeft, Search, BookOpen, Shield, Lightbulb, FileText
} from 'lucide-react';

const policyIconMap: Record<string, React.ElementType> = {
  BookOpen,
  Shield,
  Lightbulb,
  FileText,
};

export default function Policies() {
  const navigate = useNavigate();
  const { policies, loading, error } = useBankPolicies();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const policyTypes = [...new Set(policies.map(p => p.policy_type))];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = !searchQuery ||
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (policy.summary && policy.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !filterType || policy.policy_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold mb-2">Bank Policies</h1>
          <p className="text-muted-foreground">
            Review your institution's AI usage policies and guidelines.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(null)}
            >
              All
            </Button>
            {policyTypes.map(type => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Policies Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery || filterType ? 'No policies match your search.' : 'No policies available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolicies.map(policy => {
              const IconComponent = policyIconMap[policy.icon || ''] || FileText;
              return (
                <Card
                  key={policy.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
                  onClick={() => navigate(`/policies/${policy.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary">{policy.policy_type}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{policy.title}</CardTitle>
                    {policy.summary && (
                      <CardDescription>{policy.summary}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Click to read full resource</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
  );
}
