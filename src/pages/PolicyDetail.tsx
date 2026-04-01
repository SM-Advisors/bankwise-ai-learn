import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Loader2, BookOpen, Shield, Lightbulb, FileText, Calendar
} from 'lucide-react';

const policyIconMap: Record<string, React.ElementType> = {
  BookOpen,
  Shield,
  Lightbulb,
  FileText,
};

interface Policy {
  id: string;
  policy_type: string;
  title: string;
  content: string;
  summary: string | null;
  icon: string | null;
  updated_at: string | null;
}

export default function PolicyDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!id) return;
      try {
        const { data, error: fetchError } = await (supabase as any)
          .from(\'bank_policies\')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setPolicy(data);
      } catch (err) {
        console.error('Error fetching policy:', err);
        setError('Policy not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{error || 'Policy not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/policies')}>
          Back to Resources
        </Button>
      </div>
    );
  }

  const IconComponent = policyIconMap[policy.icon || ''] || FileText;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{policy.policy_type}</Badge>
                {policy.updated_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Updated {new Date(policy.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{policy.title}</CardTitle>
              {policy.summary && (
                <p className="text-muted-foreground mt-2">{policy.summary}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {policy.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
