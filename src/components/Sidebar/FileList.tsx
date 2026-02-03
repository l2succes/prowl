import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';

interface FileListProps {
  onFileClick: (path: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function truncatePath(path: string, maxLength: number = 30): string {
  if (path.length <= maxLength) return path;
  const parts = path.split('/');
  if (parts.length <= 2) return path;
  return `.../${parts.slice(-2).join('/')}`;
}

export default function FileList({ onFileClick }: FileListProps) {
  const { currentSessionId, recentFiles } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const sessionFiles = currentSessionId ? recentFiles[currentSessionId] || [] : [];

  const writtenFiles = sessionFiles.filter((f) => f.action === 'write' || f.action === 'edit');
  const readFiles = sessionFiles.filter((f) => f.action === 'read');

  if (sessionFiles.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border">
      <div
        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>📁</span>
          <span>Files</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {writtenFiles.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Recently Written
              </div>
              <div className="space-y-1">
                {writtenFiles.map((file, idx) => (
                  <button
                    key={`${file.path}-${idx}`}
                    onClick={() => onFileClick(file.path)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-muted/70 transition-colors group"
                  >
                    <div className="text-xs truncate group-hover:text-primary">
                      {truncatePath(file.path)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(file.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {readFiles.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Recently Read
              </div>
              <div className="space-y-1">
                {readFiles.map((file, idx) => (
                  <button
                    key={`${file.path}-${idx}`}
                    onClick={() => onFileClick(file.path)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-muted/70 transition-colors group"
                  >
                    <div className="text-xs truncate group-hover:text-primary">
                      {truncatePath(file.path)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(file.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
