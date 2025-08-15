
import React from 'react';
import { MicrophoneIcon, AttachmentIcon, EmojiIcon } from './Icons';

interface ChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ message, setMessage, onSendMessage, isLoading, isRecording, toggleRecording }) => {

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  }

  const IconButton: React.FC<{ children: React.ReactNode, onClick?: () => void, isActive?: boolean, label: string }> = ({ children, onClick, isActive, label }) => (
    <button 
        onClick={onClick}
        className={`p-2 transition-colors rounded-lg border border-white/10 hover:border-white/20 ${isActive ? 'text-red-500 animate-pulse' : 'text-white/50 hover:text-white'}`} 
        aria-label={label} 
        type="button"
    >
        {children}
    </button>
  );

  return (
    <div className="p-4 min-w-full">
      <div className="relative">
        <div className="relative flex flex-col border border-white/10 rounded-xl bg-black">
          <div className="overflow-y-auto">
            <textarea 
                rows={3} 
                style={{overflow: 'hidden', outline: 'none'}} 
                className="w-full px-4 py-3 resize-none bg-transparent border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/50 align-top leading-normal min-h-[80px] text-white" 
                placeholder="Ask me anything, or use the mic to talk..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
          </div>
          <div className="h-14">
            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <IconButton label="Attach file">
                    <AttachmentIcon className="w-4 h-4" />
                 </IconButton>
                 <IconButton label="Add emoji">
                    <EmojiIcon className="w-4 h-4" />
                 </IconButton>
                 <IconButton 
                    onClick={toggleRecording}
                    isActive={isRecording}
                    label={isRecording ? "Stop recording" : "Start recording"}
                 >
                    <MicrophoneIcon className="w-4 h-4" />
                </IconButton>
              </div>
              <button onClick={handleSend} disabled={isLoading || !message.trim()} className="p-2 transition-colors text-blue-500 hover:text-blue-600 disabled:text-gray-500 disabled:cursor-not-allowed" aria-label="Send message" type="button">
                <svg className="w-6 h-6" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
                  <circle r={10} cy={12} cx={12} />
                  <path d="m16 12-4-4-4 4" />
                  <path d="M12 16V8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
