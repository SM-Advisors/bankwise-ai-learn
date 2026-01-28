import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAllBankPolicies } from '@/hooks/useBankPolicies';
import { learningStyles } from '@/data/learningStyles';
import { departments } from '@/data/topics';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Users, 
  Lightbulb,
  CheckCircle,
  Target,
  Layers,
  Sparkles,
  Bot,
  Building2,
  Video,
  Play,
  Clock,
  Shield,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  FileText,
  TrendingUp,
};

const styleIconMap: Record<string, React.ElementType> = {
  'example-based': BookOpen,
  'explanation-based': Lightbulb,
  'hands-on': Target,
  'logic-based': Layers,
};

const styleColorMap: Record<string, string> = {
  'example-based': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'explanation-based': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'hands-on': 'bg-green-500/10 text-green-600 border-green-500/20',
  'logic-based': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const moduleTypeIcon: Record<string, React.ElementType> = {
  video: Video,
  document: FileText,
  example: Lightbulb,
  exercise: Play,
};

// Core training programs that all users go through
const CORE_PROGRAMS = [
  {
    id: 1,
    title: 'AI Prompting & Personalization',
    description: 'Foundation training for effective AI communication. All users start here to master prompting fundamentals, context setting, and personalization techniques.',
    icon: Sparkles,
    stage: 'Stage 1 - Foundation',
    modules: ALL_SESSION_CONTENT[1]?.modules.length || 5,
    estimatedTime: '2-3 hours',
    prerequisites: 'None - starting point for all users',
    outcomes: [
      'Master the CLEAR prompting framework',
      'Write effective prompts for banking tasks',
      'Set appropriate context for AI interactions',
      'Handle sensitive data appropriately',
    ],
  },
  {
    id: 2,
    title: 'Building Your AI Agent',
    description: 'Create a customized AI assistant tailored to your line of business. Learn agent architecture, custom instructions, and tool integration.',
    icon: Bot,
    stage: 'Stage 2 - Customization',
    modules: ALL_SESSION_CONTENT[2]?.modules.length || 5,
    estimatedTime: '3-4 hours',
    prerequisites: 'Complete Session 1: AI Prompting & Personalization',
    outcomes: [
      'Understand AI agent architecture',
      'Create custom agent instructions',
      'Configure agent for your specific role',
      'Test and refine agent behavior',
    ],
  },
  {
    id: 3,
    title: 'Department-Specific Training',
    description: 'Deep dive into AI applications specific to your line of business. Includes Accounting & Finance, Credit Administration, and Executive & Leadership tracks.',
    icon: Building2,
    stage: 'Stage 3 - Specialization',
    modules: ALL_SESSION_CONTENT[3]?.modules.length || 5,
    estimatedTime: '4-6 hours',
    prerequisites: 'Complete Session 2: Building Your AI Agent',
    outcomes: [
      'Apply AI to department-specific workflows',
      'Ensure compliance in AI usage',
      'Master advanced prompting techniques',
      'Complete real-world capstone project',
    ],
  },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const { policies, loading: policiesLoading, updatePolicy, createPolicy } = useAllBankPolicies();
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', summary: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicyForm, setNewPolicyForm] = useState({
    policy_type: '',
    title: '',
    content: '',
    summary: '',
    icon: 'BookOpen',
    display_order: 0,
    is_active: true,
  });

  const handleEditPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setEditForm({
      title: policy.title,
      content: policy.content,
      summary: policy.summary || '',
    });
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    const result = await updatePolicy(editingPolicy.id, editForm);
    if (result.success) {
      toast({ title: 'Policy updated', description: 'The policy has been saved successfully.' });
      setEditingPolicy(null);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicyForm.title || !newPolicyForm.content || !newPolicyForm.policy_type) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const result = await createPolicy(newPolicyForm);
    if (result.success) {
      toast({ title: 'Policy created', description: 'The new policy has been added.' });
      setIsCreating(false);
      setNewPolicyForm({
        policy_type: '',
        title: '',
        content: '',
        summary: '',
        icon: 'BookOpen',
        display_order: policies.length,
        is_active: true,
      });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Training Administration</h1>
        </div>
        <p className="text-muted-foreground">
          Overview of learning styles, training programs, curriculum content, and bank policies
        </p>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Programs</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Policies</span>
            <span className="sm:hidden">Policies</span>
          </TabsTrigger>
          <TabsTrigger value="learning-styles" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Styles</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Depts</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
        </TabsList>

        {/* Bank Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Bank Policy Management
                  </CardTitle>
                  <CardDescription>
                    Configure AI usage policies, data security guidelines, and best practices for your institution
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
              ) : policies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No policies configured. Click "Add Policy" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{policy.title}</CardTitle>
                              {!policy.is_active && (
                                <Badge variant="outline" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                            <CardDescription>{policy.summary}</CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditPolicy(policy)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="secondary">{policy.policy_type.replace('_', ' ')}</Badge>
                          <span>Order: {policy.display_order}</span>
                          <span>Updated: {new Date(policy.updated_at || '').toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Policy Dialog */}
          <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Policy: {editingPolicy?.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary (short description)</Label>
                    <Input
                      id="summary"
                      value={editForm.summary}
                      onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                      placeholder="Brief description for the policy card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content (Markdown supported)</Label>
                    <Textarea
                      id="content"
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="min-h-[400px] font-mono text-sm"
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPolicy(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePolicy}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Policy Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-type">Policy Type (e.g., ai_usage, data_security)</Label>
                      <Input
                        id="new-type"
                        value={newPolicyForm.policy_type}
                        onChange={(e) => setNewPolicyForm({ ...newPolicyForm, policy_type: e.target.value })}
                        placeholder="ai_usage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-title">Title</Label>
                      <Input
                        id="new-title"
                        value={newPolicyForm.title}
                        onChange={(e) => setNewPolicyForm({ ...newPolicyForm, title: e.target.value })}
                        placeholder="AI Usage Policy"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-summary">Summary</Label>
                    <Input
                      id="new-summary"
                      value={newPolicyForm.summary}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, summary: e.target.value })}
                      placeholder="Brief description for the policy card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-content">Content (Markdown supported)</Label>
                    <Textarea
                      id="new-content"
                      value={newPolicyForm.content}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, content: e.target.value })}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="# Policy Title&#10;&#10;## Section 1&#10;&#10;Policy content here..."
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCreatePolicy}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Training Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Training Program Overview
              </CardTitle>
              <CardDescription>
                Three-stage progressive training: Foundation → Customization → Specialization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Program Flow Diagram */}
              <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Stage 1: Prompting</span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-600">Stage 2: Agent Building</span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">Stage 3: Specialization</span>
                </div>
              </div>

              <div className="space-y-6">
                {CORE_PROGRAMS.map((program, idx) => {
                  const IconComponent = program.icon;
                  const stageColors = [
                    'border-blue-500/30 bg-blue-500/5',
                    'border-purple-500/30 bg-purple-500/5',
                    'border-green-500/30 bg-green-500/5',
                  ];
                  
                  return (
                    <Card key={program.id} className={`border-2 ${stageColors[idx]}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-background rounded-lg shadow-sm">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <Badge variant="outline" className="mb-1">{program.stage}</Badge>
                              <CardTitle className="text-xl">{program.title}</CardTitle>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              {program.modules} modules
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Clock className="h-4 w-4" />
                              {program.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="mt-2">{program.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Learning Outcomes
                            </h4>
                            <ul className="space-y-1">
                              {program.outcomes.map((outcome, outIdx) => (
                                <li key={outIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                            <p className="text-sm text-muted-foreground">{program.prerequisites}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Styles Tab */}
        <TabsContent value="learning-styles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Interaction Preference Styles
              </CardTitle>
              <CardDescription>
                Four distinct learning approaches that determine how training content is delivered to each employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {learningStyles.map((style) => {
                  const IconComponent = styleIconMap[style.id] || BookOpen;
                  return (
                    <Card key={style.id} className={`border-2 ${styleColorMap[style.id]}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-background">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{style.name}</CardTitle>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {style.id}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm font-medium">{style.shortDescription}</p>
                        <p className="text-sm text-muted-foreground">{style.fullDescription}</p>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Key Characteristics:</h4>
                          <ul className="space-y-1">
                            {style.characteristics.map((char, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                                {char}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold mb-1">Lesson Delivery Approach:</h4>
                          <p className="text-sm text-muted-foreground">{style.lessonApproach}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Tracks Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Department-Specific Training Tracks
              </CardTitle>
              <CardDescription>
                Specialized AI training topics for each line of business (Stage 3 content)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {departments.map((dept) => {
                  const IconComponent = iconMap[dept.icon] || FileText;
                  return (
                    <Card key={dept.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{dept.name}</CardTitle>
                            <CardDescription>{dept.description}</CardDescription>
                          </div>
                          <Badge className="ml-auto">{dept.topics.length} Topics</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {dept.topics.map((topic) => (
                            <Card key={topic.id} className="bg-muted/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base leading-tight">{topic.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">{topic.description}</p>
                                <Badge variant="outline" className="mt-3 text-xs">
                                  {topic.id}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Documentation Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Curriculum Content Guide
              </CardTitle>
              <CardDescription>
                Detailed module content, learning objectives, and expected outcomes for all sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="multiple" className="space-y-4">
                  {Object.values(ALL_SESSION_CONTENT).map((session) => (
                    <AccordionItem key={session.id} value={`session-${session.id}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          {session.id === 1 && <Sparkles className="h-5 w-5 text-primary" />}
                          {session.id === 2 && <Bot className="h-5 w-5 text-primary" />}
                          {session.id === 3 && <Building2 className="h-5 w-5 text-primary" />}
                          <span className="font-semibold">Session {session.id}: {session.title}</span>
                          <Badge variant="secondary">{session.modules.length} modules</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-6">
                          {session.modules.map((module, moduleIdx) => {
                            const ModuleIcon = moduleTypeIcon[module.type] || BookOpen;
                            return (
                              <div key={module.id} className="border-l-4 border-primary/30 pl-4">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="p-2 bg-muted rounded-lg">
                                    <ModuleIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">
                                      Module {moduleIdx + 1}: {module.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{module.type}</Badge>
                                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {module.estimatedTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-muted-foreground mb-4">{module.description}</p>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <Target className="h-4 w-4 text-primary" />
                                      Learning Objectives
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {module.learningObjectives.map((obj, objIdx) => (
                                        <li key={objIdx}>• {obj}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Practice Task
                                    </h5>
                                    <p className="text-sm font-medium">{module.content.practiceTask.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {module.content.practiceTask.instructions}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                                  <h5 className="font-medium text-sm mb-2 text-blue-600">
                                    Content Delivery by Learning Style
                                  </h5>
                                  <div className="grid gap-2 text-sm">
                                    {learningStyles.map((style) => (
                                      <div key={style.id} className="flex items-start gap-2">
                                        <Badge variant="outline" className={`text-xs shrink-0 ${styleColorMap[style.id]}`}>
                                          {style.name}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          {style.id === 'example-based' && 'Opens with annotated sample output, then deconstructs process'}
                                          {style.id === 'explanation-based' && 'Provides comprehensive context and step-by-step rationale'}
                                          {style.id === 'hands-on' && 'Quick context, immediate guided practice with feedback'}
                                          {style.id === 'logic-based' && 'Decision framework first, failure modes, then systematic execution'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{CORE_PROGRAMS.length}</p>
                    <p className="text-sm text-muted-foreground">Core Programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Object.values(ALL_SESSION_CONTENT).reduce((acc, s) => acc + s.modules.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{departments.length}</p>
                    <p className="text-sm text-muted-foreground">Department Tracks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Brain className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{learningStyles.length}</p>
                    <p className="text-sm text-muted-foreground">Learning Styles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
