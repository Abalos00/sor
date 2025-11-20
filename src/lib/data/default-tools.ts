export type DefaultTool = {
  id: string;
  name: string;
  os: string;
  type: string;
  installer: string | null;
  package: string | null;
};

export const defaultTools: DefaultTool[] = [
  { id: "edge", name: "Microsoft Edge", os: "windows", type: "app", installer: "winget", package: "Microsoft.Edge" },
  { id: "libreoffice", name: "LibreOffice", os: "windows", type: "app", installer: "winget", package: "TheDocumentFoundation.LibreOffice" },
  { id: "7zip", name: "7zip", os: "windows", type: "app", installer: "winget", package: "7zip.7zip" },
  { id: "vlc", name: "VLC Player", os: "windows", type: "app", installer: "winget", package: "VideoLAN.VLC" },
  { id: "sumatra", name: "SumatraPDF", os: "windows", type: "app", installer: "winget", package: "SumatraPDF.SumatraPDF" },
  { id: "excel", name: "Microsoft Excel", os: "windows", type: "app", installer: "winget", package: "Microsoft.Excel" },
  { id: "word", name: "Microsoft Word", os: "windows", type: "app", installer: "winget", package: "Microsoft.Word" },
  { id: "powerpoint", name: "Microsoft PowerPoint", os: "windows", type: "app", installer: "winget", package: "Microsoft.PowerPoint" },
  { id: "teams", name: "Microsoft Teams", os: "windows", type: "app", installer: "winget", package: "Microsoft.Teams" },
  { id: "onedrive", name: "Microsoft OneDrive", os: "windows", type: "app", installer: "winget", package: "Microsoft.OneDrive" },
  { id: "canva", name: "Canva Desktop", os: "windows", type: "app", installer: "winget", package: "Canva.Canva" },
  { id: "figma", name: "Figma Desktop", os: "windows", type: "app", installer: "winget", package: "Figma.Figma" },
  { id: "vscode", name: "Visual Studio Code", os: "windows", type: "app", installer: "winget", package: "Microsoft.VisualStudioCode" },
  { id: "pycharm", name: "PyCharm Community", os: "windows", type: "app", installer: "winget", package: "JetBrains.PyCharm.Community" },
  { id: "git", name: "Git", os: "windows", type: "app", installer: "winget", package: "Git.Git" },
  { id: "node", name: "Node.js LTS", os: "windows", type: "runtime", installer: "winget", package: "OpenJS.NodeJS.LTS" },
  { id: "slack", name: "Slack", os: "windows", type: "app", installer: "winget", package: "SlackTechnologies.Slack" },
  { id: "zoom", name: "Zoom", os: "windows", type: "app", installer: "winget", package: "Zoom.Zoom" },
  { id: "googledrive", name: "Google Drive", os: "windows", type: "app", installer: "winget", package: "Google.Drive" },
  { id: "anydesk", name: "AnyDesk", os: "windows", type: "app", installer: "winget", package: "AnyDeskSoftwareGmbH.AnyDesk" },
  { id: "freshdesk", name: "Freshdesk Agent", os: "windows", type: "app", installer: "winget", package: "Freshdesk.Agent" },
  { id: "defender", name: "Microsoft Defender for Endpoint", os: "windows", type: "security", installer: "scripts", package: "mdm/defender" },
  { id: "crowdstrike", name: "CrowdStrike Sensor", os: "windows", type: "security", installer: "scripts", package: "crowdstrike/sensor" },
  { id: "brave", name: "Brave Hardened", os: "windows", type: "app", installer: "winget", package: "Brave.Brave" },
  { id: "wslubuntu", name: "WSL + Ubuntu", os: "windows", type: "runtime", installer: "scripts", package: "wsl/ubuntu" },
];
