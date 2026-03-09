import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PanelLeftClose, PanelLeftOpen, SquarePen, Search,
  Bot, FolderOpen, Clock, ChevronDown, ChevronRight,
  CheckCircle, MoreHorizontal, Lock,
} from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';
import { type ModuleEngagement } from '@/types/progress';
import { getModuleState } from '@/utils/computeProgress';
import { type PracticeConversation } from '@/hooks/usePracticeConversations';

interface ChatGPTSidebarProps {
  // Same as ModuleListSidebar
  collapsed: boolean;
  onToggleCollapse: () => void;
  modules: ModuleContent[];
  selectedModule: ModuleContent | null;
  completedModules: Set<string>;
  moduleEngagement: Record<string, ModuleEngagement>;
  onSelectModule: (module: ModuleContent) => void;
  onGateBypass?: (moduleId: string) => void;
  // Additional Edge props
  conversations: PracticeConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  displayName?: string;
  orgName?: string;
}

function isModuleLocked(
  module: ModuleContent,
  allModules: ModuleContent[],
  moduleEngagement: Record<string, ModuleEngagement>,
  completedModules: Set<string>,
): boolean {
  const moduleIndex = allModules.findIndex(m => m.id === module.id);
  for (let i = 0; i < moduleIndex; i++) {
    const candidate = allModules[i];
    if (!candidate.isGateModule) continue;
    const eng = moduleEngagement[candidate.id];
    const passed = eng?.gatePassed === true || completedModules.has(candidate.id);
    if (!passed) return true;
  }
  return false;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const NAV_ITEM =
  'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm transition-colors text-left';

const ICON_BTN =
  'p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';

export function ChatGPTSidebar({
  collapsed,
  onToggleCollapse,
  modules,
  selectedModule,
  completedModules,
  moduleEngagement,
  onSelectModule,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  displayName,
  orgName,
}: ChatGPTSidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside
      data-tour="lesson-content"
      className={`flex flex-col h-full bg-[#f9f9f9] dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shrink-0 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
      aria-label="Training modules navigation"
    >
      {/* ── Top row: collapse toggle + new chat ── */}
      <div
        className={`flex items-center pt-3 pb-2 shrink-0 ${
          collapsed ? 'flex-col gap-2 px-1' : 'justify-between px-2'
        }`}
      >
        <button
          onClick={onToggleCollapse}
          className={ICON_BTN}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={onNewChat}
          className={ICON_BTN}
          aria-label="New chat"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>

      {/* ── Collapsed icons ── */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 px-1 pt-1">
          <button
            onClick={() => navigate('/agents')}
            className={ICON_BTN}
            title="Custom Agents"
          >
            <Bot className="h-5 w-5" />
          </button>
          <button
            onClick={() => {/* projects nav */}}
            className={ICON_BTN}
            title="Projects"
          >
            <FolderOpen className="h-5 w-5" />
          </button>
          <button
            onClick={() => {/* recents nav */}}
            className={ICON_BTN}
            title="Recents"
          >
            <Clock className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── Expanded content ── */}
      {!collapsed && (
        <>
          {/* Search chats */}
          <div className="px-2 pb-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search chats"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            {/* Custom Agents */}
            <button
              onClick={() => navigate('/agents')}
              className={NAV_ITEM}
            >
              <Bot className="h-4 w-4 shrink-0" />
              Custom Agents
            </button>

            {/* Projects (current session modules) */}
            <button
              onClick={() => setProjectsOpen(o => !o)}
              className={NAV_ITEM}
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="flex-1">Projects</span>
              {projectsOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
            </button>

            {projectsOpen && (
              <div className="ml-3 mb-1 space-y-0.5">
                {modules.map(m => {
                  const engagement = moduleEngagement[m.id];
                  const isLegacyCompleted = completedModules.has(m.id);
                  const locked = isModuleLocked(m, modules, moduleEngagement, completedModules);
                  const state = engagement
                    ? getModuleState(engagement)
                    : isLegacyCompleted
                    ? 'completed'
                    : 'not_started';
                  const isSelected = selectedModule?.id === m.id;

                  return (
                    <button
                      key={m.id}
                      disabled={locked}
                      onClick={() => !locked && onSelectModule(m)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                        isSelected
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          : locked
                          ? 'opacity-40 cursor-not-allowed text-gray-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {locked ? (
                        <Lock className="h-3 w-3 shrink-0 text-gray-400" />
                      ) : state === 'completed' ? (
                        <CheckCircle className="h-3 w-3 shrink-0 text-green-500" />
                      ) : (
                        <span className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate">{m.id} — {m.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recents */}
            <button
              onClick={() => setRecentsOpen(o => !o)}
              className={`${NAV_ITEM} mt-1`}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span className="flex-1">Recents</span>
              {recentsOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
            </button>

            {recentsOpen && filteredConversations.length > 0 && (
              <div className="ml-3 mb-1 space-y-0.5">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      conv.id === activeConversationId
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <p className="truncate text-sm">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatRelativeTime(conv.updated_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {recentsOpen && filteredConversations.length === 0 && (
              <p className="ml-3 px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                {searchQuery ? 'No chats match your search.' : 'No recent conversations.'}
              </p>
            )}
          </ScrollArea>

          {/* ── User info row ── */}
          <div className="px-2 pb-3 pt-2 border-t border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                  {displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-tight">
                  {orgName || ''}
                </p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
