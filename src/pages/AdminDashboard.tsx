import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { learningStyles } from '@/data/learningStyles';
import { departments } from '@/data/topics';
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
  Layers
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

export default function AdminDashboard() {
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
          Overview of learning styles, training programs, and curriculum content
        </p>
      </div>

      <Tabs defaultValue="learning-styles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="learning-styles" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Learning Styles</span>
            <span className="sm:hidden">Styles</span>
          </TabsTrigger>
          <TabsTrigger value="trainings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Training Programs</span>
            <span className="sm:hidden">Programs</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content Documentation</span>
            <span className="sm:hidden">Content</span>
          </TabsTrigger>
        </TabsList>

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

        {/* Training Programs Tab */}
        <TabsContent value="trainings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Department Training Programs
              </CardTitle>
              <CardDescription>
                AI-focused training topics organized by department, covering banking-specific workflows
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
                Curriculum Content Documentation
              </CardTitle>
              <CardDescription>
                Comprehensive documentation of lesson content, learning objectives, and expected outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="multiple" className="space-y-4">
                  {departments.map((dept) => {
                    const IconComponent = iconMap[dept.icon] || FileText;
                    return (
                      <AccordionItem key={dept.id} value={dept.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <span className="font-semibold">{dept.name}</span>
                            <Badge variant="secondary">{dept.topics.length} modules</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-6">
                            {dept.topics.map((topic, topicIdx) => (
                              <div key={topic.id} className="border-l-4 border-primary/30 pl-4">
                                <h4 className="font-semibold text-lg mb-2">
                                  Module {topicIdx + 1}: {topic.title}
                                </h4>
                                <p className="text-muted-foreground mb-4">{topic.description}</p>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <Target className="h-4 w-4 text-primary" />
                                      Learning Objectives
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      <li>• Understand AI capabilities for this workflow</li>
                                      <li>• Apply appropriate prompting techniques</li>
                                      <li>• Produce banking-compliant outputs</li>
                                      <li>• Validate AI-generated content</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Expected Outcomes
                                    </h5>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      <li>• Job-ready artifact production</li>
                                      <li>• Demonstrated AI proficiency</li>
                                      <li>• Compliance with bank standards</li>
                                      <li>• Workflow efficiency gains</li>
                                    </ul>
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
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
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
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{learningStyles.length}</p>
                    <p className="text-sm text-muted-foreground">Learning Styles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{departments.length}</p>
                    <p className="text-sm text-muted-foreground">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {departments.reduce((acc, d) => acc + d.topics.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Training Topics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Layers className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {departments.reduce((acc, d) => acc + d.topics.length, 0) * learningStyles.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Lesson Variations</p>
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
