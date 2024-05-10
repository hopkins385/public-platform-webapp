import {
  SettingsIcon,
  SquareArrowOutUpRightIcon,
  Trash2Icon,
  AlignJustify,
  FileTextIcon,
  FolderIcon,
  FoldersIcon,
  UsersIcon,
  WorkflowIcon,
} from 'lucide-vue-next';

export default function useIcons() {
  function getIcon(name: string) {
    return {
      settings: SettingsIcon,
      'up-right': SquareArrowOutUpRightIcon,
      trash: Trash2Icon,
      users: UsersIcon,
      folder: FolderIcon,
      folders: FoldersIcon,
      text: FileTextIcon,
      workflow: WorkflowIcon,
      project: AlignJustify,
    }[name];
  }

  return {
    getIcon,
  };
}
