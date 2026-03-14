import { Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceMicButtonProps {
  /** Called with final transcript text to insert into the input */
  onTranscript: (text: string) => void;
  /** Called with interim (live) transcript during recording */
  onInterimTranscript?: (text: string) => void;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'default';
  /** Whether the button is disabled */
  disabled?: boolean;
}

export function VoiceMicButton({
  onTranscript,
  onInterimTranscript,
  className,
  size = 'sm',
  disabled = false,
}: VoiceMicButtonProps) {
  const { toast } = useToast();

  const { isRecording, isProcessing, toggleRecording } = useVoiceToText({
    onTranscript: (text) => {
      onTranscript(text);
      toast({ title: 'Transcribed', description: text.slice(0, 80) + (text.length > 80 ? '…' : '') });
    },
    onInterimTranscript,
    onError: (error) => {
      toast({ title: 'Voice input error', description: error, variant: 'destructive' });
    },
  });

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || isProcessing}
          onClick={toggleRecording}
          className={cn(
            btnSize,
            'p-0 shrink-0',
            isRecording && 'text-red-500 animate-pulse',
            isProcessing && 'text-muted-foreground',
            className
          )}
        >
          {isProcessing ? (
            <Loader2 className={cn(iconSize, 'animate-spin')} />
          ) : (
            <Mic className={iconSize} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isProcessing ? 'Transcribing…' : isRecording ? 'Listening — tap to stop' : 'Voice input'}
      </TooltipContent>
    </Tooltip>
  );
}
