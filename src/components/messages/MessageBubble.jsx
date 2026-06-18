import ProjectShareCard from './ProjectShareCard';
import Avatar from '../ui/Avatar';
import { Eye } from 'lucide-react';

export default function MessageBubble({ message, isSelf, isSeen, isLast, recipient }) {
  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const hasSharedProject = !!message.sharedProject;

  return (
    <div className={`flex gap-2.5 max-w-[75%] ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Sender Avatar */}
      {!isSelf && (
        <Avatar user={message.sender} size="xxs" ring={false} className="self-end" />
      )}

      {/* Bubble container */}
      <div className="flex flex-col">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isSelf
              ? 'bg-maroon-gradient text-cream-light rounded-br-none'
              : 'glass text-[#561C24] dark:text-cream rounded-bl-none'
          }`}
        >
          {/* Message text */}
          {!hasSharedProject ? (
            <p className="break-words white-space-pre-wrap">{message.text}</p>
          ) : (
            <div>
              <p className="text-[11px] opacity-75 font-semibold leading-none mb-1 select-none">
                {isSelf ? 'You shared a project' : 'Shared a project'}
              </p>
              <ProjectShareCard project={message.sharedProject} />
              {message.text && message.text !== `Shared a project: ${message.sharedProject?.title}` && (
                <p className="mt-2 pt-2 border-t border-white/10 break-words">{message.text}</p>
              )}
            </div>
          )}
        </div>

        {/* Timestamp & Status */}
        <div className={`flex items-center gap-1.5 mt-1 text-[9px] opacity-50 ${isSelf ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isSelf && isLast && (
            <span className="flex items-center gap-1 select-none font-bold">
              {isSeen ? (
                <span className="flex items-center gap-1 text-[#561C24] dark:text-cream leading-none">
                  Seen
                  {recipient && (
                    <Avatar user={recipient} size="xxs" ring={false} className="w-3.5 h-3.5 shrink-0" />
                  )}
                </span>
              ) : (
                'Sent'
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
