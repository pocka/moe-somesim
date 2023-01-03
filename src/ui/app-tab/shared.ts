export function generateTabId(value: string): string {
  return `app_tab__tab__${value}`;
}

export function generatePanelId(value: string): string {
  return `app_tab__panel__${value}`;
}

export const SelectEvent = "app-tab-select";
