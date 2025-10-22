export interface CommandOption {
  key: string;
  label: string;
  description: string;
}

export const COMMAND_OPTIONS: CommandOption[] = [
  { 
    key: "help", 
    label: "@help – Show all available commands",
    description: "Show all available commands and how to use them"
  },
  { 
    key: "brainstorm", 
    label: "@brainstorm – Start brainstorming session",
    description: "Start an interactive brainstorming session with guided techniques"
  },
  { 
    key: "pm", 
    label: "@pm – Start project management session",
    description: "Start a project management session for idea prioritization and planning"
  },
];

export const WELCOME_MESSAGE = `Welcome to Project Assist!

Available Commands:
${COMMAND_OPTIONS.map(cmd => `• @${cmd.key} - ${cmd.description}`).join('\n')}

To begin, type a command (e.g., @brainstorm)`;

export const HELP_RESPONSE = `Available Commands:

${COMMAND_OPTIONS.map(cmd => `• @${cmd.key} - ${cmd.description}`).join('\n')}

To begin, type a command (e.g., @brainstorm)`;

export const COMMAND_PATTERN = /^@(\w+)(\s+.*)?$/;

export interface ParsedCommand {
  command: string;
  args: string;
}

export function parseCommand(input: string): ParsedCommand | null {
  const match = input.trim().match(COMMAND_PATTERN);
  if (match) {
    return {
      command: match[1].toLowerCase(),
      args: match[2]?.trim() || ""
    };
  }
  return null;
}
