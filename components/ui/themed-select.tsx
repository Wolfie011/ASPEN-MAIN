import { useTheme } from "next-themes";
import AsyncSelect from "react-select/async";

const customStyles = (theme: string) => ({
  control: (styles: any) => ({
    ...styles,
    backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    borderColor: theme === "dark" ? "#4A5568" : "#CBD5E0",
    color: theme === "dark" ? "#E2E8F0" : "#2D3748",
    "&:hover": {
      borderColor: theme === "dark" ? "#718096" : "#A0AEC0",
    },
  }),
  menu: (styles: any) => ({
    ...styles,
    backgroundColor: theme === "dark" ? "#2D3748" : "#FFFFFF",
    color: theme === "dark" ? "#E2E8F0" : "#2D3748",
  }),
  option: (styles: any, { isFocused, isSelected }: any) => ({
    ...styles,
    backgroundColor: isSelected
      ? theme === "dark"
        ? "#4A5568"
        : "#E2E8F0"
      : isFocused
      ? theme === "dark"
        ? "#718096"
        : "#A0AEC0"
      : "transparent",
    color: isSelected ? "#FFFFFF" : theme === "dark" ? "#E2E8F0" : "#2D3748",
  }),
  singleValue: (styles: any) => ({
    ...styles,
    color: theme === "dark" ? "#E2E8F0" : "#2D3748",
  }),
  multiValue: (styles: any) => ({
    ...styles,
    backgroundColor: theme === "dark" ? "#4A5568" : "#E2E8F0",
  }),
  multiValueLabel: (styles: any) => ({
    ...styles,
    color: theme === "dark" ? "#E2E8F0" : "#2D3748",
  }),
  multiValueRemove: (styles: any) => ({
    ...styles,
    color: theme === "dark" ? "#E2E8F0" : "#2D3748",
    "&:hover": {
      backgroundColor: theme === "dark" ? "#718096" : "#A0AEC0",
      color: "#FFFFFF",
    },
  }),
});

export default function ThemedAsyncSelect({ ...props }) {
  const { theme } = useTheme(); // ✅ Get current theme

  return <AsyncSelect styles={customStyles(theme ?? "light")} {...props} />;
}
