import { Input } from "../ui/input";
import { Label } from "../ui/label";

type EditableInputProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const EditableInput = ({
  label,
  icon,
  value,
  onChange,
  disabled,
}: EditableInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-500">{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1.5">{icon}</div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
