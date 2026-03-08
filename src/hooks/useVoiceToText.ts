import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseVoiceToTextOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceToText({ onTranscript, onError }: UseVoiceToTextOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use webm if supported, fallback to mp4
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          onError?.('No audio recorded');
          return;
        }

        setIsProcessing(true);
        try {
          // Convert to base64 for JSON transport
          const buffer = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          const { data, error } = await supabase.functions.invoke('speech-to-text', {
            body: { audio: base64, mimeType },
          });

          if (error) throw error;
          if (data?.transcript) {
            onTranscript?.(data.transcript);
          } else if (data?.error) {
            onError?.(data.error);
          } else {
            onError?.('No transcript returned');
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Transcription failed';
          onError?.(msg);
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      onError?.(msg);
    }
  }, [onTranscript, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
