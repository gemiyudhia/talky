import { Edit2, LogOut, Save, XCircle } from "lucide-react";
import { Button } from "../ui/button";

type ActionButtonsProps = {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onLogout: () => void;
};

export const ActionButtons = ({
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onLogout,
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col space-y-4 w-full mt-5">
      {isEditing ? (
        <div className="flex space-x-4 w-full">
          <Button
            className="flex-1 bg-primary hover:bg-primary-hover"
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4 text-white" />
            <p className="text-white">Save Changes</p>
          </Button>
          <Button className="flex-1" variant="outline" onClick={onCancel}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          className="w-full bg-primary hover:bg-primary-hover"
          onClick={onEdit}
        >
          <Edit2 className="mr-2 h-4 w-4 text-white" />
          <p className="text-white">Edit Profile</p>
        </Button>
      )}
      <Button
        className="w-full bg-secondary hover:bg-secondary-hover"
        variant="outline"
        onClick={onLogout}
      >
        <LogOut className="mr-2 h-4 w-4 text-white" />
        <p className='text-white'>Logout</p>
      </Button>
    </div>
  );
};
