import { Event } from '@/hooks/useEvents';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Clock, MapPin, Users, ExternalLink,
  GraduationCap, Coffee, Video, Flag, MessageCircle,
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  live_training: { label: 'Live Training', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  office_hours: { label: 'Office Hours', icon: Coffee, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  webinar: { label: 'Webinar', icon: Video, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  deadline: { label: 'Deadline', icon: Flag, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  community_session: { label: 'Community Session', icon: MessageCircle, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

export function getEventTypeConfig(eventType: string) {
  return EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.live_training;
}

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function EventModal({ open, onOpenChange, event }: EventModalProps) {
  if (!event) return null;

  const config = getEventTypeConfig(event.event_type);
  const IconComponent = config.icon;
  const eventDate = new Date(event.scheduled_date);
  const isUpcoming = eventDate >= new Date();
  const isUrl = event.location?.startsWith('http');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className={config.color}>
              {config.label}
            </Badge>
            {!isUpcoming && <Badge variant="outline">Past</Badge>}
          </div>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {event.duration_minutes && ` (${event.duration_minutes} min)`}
              </span>
            </div>
            {event.instructor && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.instructor}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {isUrl ? (
                  <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    Join Link <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span>{event.location}</span>
                )}
              </div>
            )}
            {event.max_attendees && (
              <div className="text-xs text-muted-foreground">
                Max {event.max_attendees} attendees
              </div>
            )}
          </div>

          {isUpcoming && isUrl && event.location && (
            <Button asChild className="w-full gap-2">
              <a href={event.location} target="_blank" rel="noopener noreferrer">
                Join Event
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
