import { Children, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { CaretDown, CaretUp, Check } from "@phosphor-icons/react";
const EMPTY = "__all__";
/** Shared themed select; keeps native form names and existing onChange contracts. */
export default function Dropdown({
  children,
  value,
  onChange,
  name,
  "aria-label": label,
}) {
  const options = Children.toArray(children).map((option) => ({
    value: String(option.props.value ?? option.props.children),
    label: option.props.children,
  }));
  const [internal, setInternal] = useState(options[0]?.value ?? "");
  const selected = value === undefined ? internal : String(value);
  return (
    <Select.Root
      name={name}
      value={selected || EMPTY}
      onValueChange={(next) => {
        const result = next === EMPTY ? "" : next;
        setInternal(result);
        onChange?.({ target: { value: result } });
      }}
    >
      <Select.Trigger
        className={"dropdown-trigger " + (name ? "dropdown-field" : "")}
        aria-label={
          label ||
          (name === "semester"
            ? "Semester"
            : name === "doc_type"
              ? "Document type"
              : undefined)
        }
      >
        <Select.Value />
        <Select.Icon>
          <CaretDown size={15} weight="bold" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="dropdown-content"
          position="popper"
          sideOffset={7}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="dropdown-scroll">
            <CaretUp size={15} />
          </Select.ScrollUpButton>
          <Select.Viewport className="dropdown-viewport">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value || EMPTY}
                className="dropdown-option"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="dropdown-check">
                  <Check size={16} weight="bold" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="dropdown-scroll">
            <CaretDown size={15} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
