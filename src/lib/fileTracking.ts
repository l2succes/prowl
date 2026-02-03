import { Message } from './protocol';
import { FileTouch } from '@/stores/appStore';

const FILE_TOOLS = {
  Read: 'read',
  Write: 'write',
  Edit: 'edit',
} as const;

export function extractFileTouches(message: Message): FileTouch[] {
  const touches: FileTouch[] = [];
  const timestamp = Date.now();

  for (const content of message.content) {
    if (content.type === 'tool_use') {
      const toolName = content.name;
      const action = FILE_TOOLS[toolName as keyof typeof FILE_TOOLS];

      if (action && content.input) {
        // Extract file path from tool input
        let path: string | undefined;

        // Check common path parameter names
        if (content.input.file_path) {
          path = content.input.file_path;
        } else if (content.input.path) {
          path = content.input.path;
        } else if (content.input.notebook_path) {
          path = content.input.notebook_path;
        }

        if (path && typeof path === 'string') {
          touches.push({
            path,
            action: action as 'read' | 'write' | 'edit',
            timestamp,
          });
        }
      }
    }
  }

  return touches;
}
