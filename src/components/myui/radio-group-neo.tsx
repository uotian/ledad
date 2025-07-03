import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  name: string;
  valueMap: Record<string, string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export default function RadioGroupNeo({
  name,
  valueMap,
  defaultValue,
  onValueChange,
}: Props) {
  const radioValues = Object.entries(valueMap).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-4">
      <Label className="font-bold">{name}</Label>
      <RadioGroup
        defaultValue={defaultValue || radioValues[0]?.value}
        className="flex gap-6 flex-wrap"
        onValueChange={onValueChange}
      >
        {radioValues.map((item) => {
          const uniqueId = `${name}-${item.value}`;
          return (
            <div key={item.value} className="flex items-center gap-2">
              <RadioGroupItem value={item.value} id={uniqueId} />
              <Label htmlFor={uniqueId}>{item.label}</Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
