# Dropdown Standardization

A comprehensive guide to using the standardized dropdown system across Xpeak AI.

## Overview

All dropdowns in Xpeak AI now use a single, standardized `Dropdown` component that provides:
- **Consistent placement and styling** using design tokens
- **Full keyboard navigation** (Arrow keys, Enter, Escape, Tab)
- **Accessibility compliance** with proper ARIA attributes
- **Flexible customization** for different use cases

## Core Components

### Dropdown (Primitive)
The base dropdown component that handles all interactions and styling.

```tsx
import { Dropdown, DropdownOption } from '@/app/components/ui';

const options: DropdownOption[] = [
  { value: 'en', label: 'English', icon: '🇺🇸' },
  { value: 'es', label: 'Español', icon: '🇪🇸' },
  { value: 'zh', label: '中文', icon: '🇨🇳' }
];

<Dropdown
  options={options}
  onSelect={(option) => console.log(option)}
  placeholder="Select language"
/>
```

### LanguageSelectorMenu (Specialized)
A pre-configured dropdown for language selection.

```tsx
import LanguageSelectorMenu from '@/app/components/molecules/LanguageSelectorMenu';

<LanguageSelectorMenu
  options={languageOptions}
  onSelect={(lang) => console.log(lang)}
  size="md"
  variant="outlined"
/>
```

## Props Reference

### DropdownProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | **Required** | Array of dropdown options |
| `value` | `string` | `undefined` | Currently selected value |
| `onSelect` | `(option: DropdownOption) => void` | **Required** | Selection handler |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `trigger` | `React.ReactNode` | `undefined` | Custom trigger element |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Visual variant |
| `placement` | `'bottom' \| 'top' \| 'left' \| 'right'` | `'bottom'` | Dropdown placement |
| `width` | `'auto' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'auto'` | Width preset |
| `maxHeight` | `string` | `'200px'` | Maximum height of dropdown |

### DropdownOption

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Unique identifier for the option |
| `label` | `string` | Display text |
| `icon` | `React.ReactNode` | Optional icon (emoji, SVG, etc.) |
| `disabled` | `boolean` | Disable this specific option |

## Usage Examples

### Basic Dropdown
```tsx
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

<Dropdown
  options={options}
  onSelect={(option) => setSelected(option.value)}
  placeholder="Choose an option"
/>
```

### Language Selector
```tsx
const languages = [
  { label: 'English', code: 'EN', flag: '🇺🇸' },
  { label: 'Español', code: 'ES', flag: '🇪🇸' },
  { label: '中文', code: 'ZH', flag: '🇨🇳' }
];

<LanguageSelectorMenu
  options={languages}
  onSelect={(lang) => setLanguage(lang.code)}
  size="sm"
  variant="outlined"
  width="md"
/>
```

### Custom Trigger
```tsx
<Dropdown
  options={options}
  onSelect={handleSelect}
  trigger={
    <Button variant="outline" className="flex items-center gap-2">
      <UserIcon className="w-4 h-4" />
      Select User
    </Button>
  }
/>
```

### Different Placements
```tsx
// Bottom placement (default)
<Dropdown options={options} onSelect={handleSelect} placement="bottom" />

// Top placement
<Dropdown options={options} onSelect={handleSelect} placement="top" />

// Left placement
<Dropdown options={options} onSelect={handleSelect} placement="left" />

// Right placement
<Dropdown options={options} onSelect={handleSelect} placement="right" />
```

## Keyboard Navigation

The dropdown supports full keyboard navigation:

- **Arrow Down**: Open dropdown and navigate down
- **Arrow Up**: Open dropdown and navigate up
- **Enter/Space**: Select focused option
- **Escape**: Close dropdown
- **Tab**: Close dropdown and move to next element
- **Mouse**: Hover to focus options

## Accessibility Features

- **ARIA Attributes**: Proper `role`, `aria-expanded`, `aria-selected`
- **Focus Management**: Focus returns to trigger when closed
- **Screen Reader Support**: Announcements for state changes
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Works with high contrast themes

## Design Tokens

The dropdown uses consistent design tokens:

- **Colors**: `token-surface`, `token-text`, `token-primary`, etc.
- **Spacing**: `token-3`, `token-4`, `token-lg`, etc.
- **Border Radius**: `token-lg`, `token-xl`
- **Shadows**: `token-lg`
- **Transitions**: `duration-token-base`

## Migration Guide

### From Custom Dropdowns

1. **Replace custom state management**:
   ```tsx
   // Before
   const [isOpen, setIsOpen] = useState(false);
   const [selected, setSelected] = useState(options[0]);
   
   // After
   <Dropdown options={options} onSelect={handleSelect} />
   ```

2. **Replace custom keyboard handling**:
   ```tsx
   // Before
   const handleKeyDown = (e) => {
     if (e.key === 'ArrowDown') { /* custom logic */ }
   };
   
   // After
   // Keyboard handling is built-in
   ```

3. **Replace custom styling**:
   ```tsx
   // Before
   <div className="custom-dropdown-styles">
   
   // After
   <Dropdown variant="outlined" size="md" />
   ```

### From LanguageSelectorMenu (Old)

The old `LanguageSelectorMenu` has been refactored to use the new `Dropdown`:

```tsx
// Before (old implementation)
<LanguageSelectorMenu
  options={languages}
  onSelect={handleSelect}
/>

// After (same API, new implementation)
<LanguageSelectorMenu
  options={languages}
  onSelect={handleSelect}
  size="md"
  variant="outlined"
/>
```

## Best Practices

1. **Use appropriate variants**:
   - `outlined` for form inputs
   - `default` for general use
   - `filled` for emphasis

2. **Choose correct sizes**:
   - `sm` for compact spaces
   - `md` for standard use
   - `lg` for prominent actions

3. **Set appropriate widths**:
   - `auto` for content-based width
   - `sm`/`md`/`lg`/`xl` for fixed widths

4. **Handle disabled states**:
   ```tsx
   <Dropdown
     options={options}
     onSelect={handleSelect}
     disabled={isLoading}
   />
   ```

5. **Use icons consistently**:
   ```tsx
   const options = [
     { value: 'edit', label: 'Edit', icon: <EditIcon /> },
     { value: 'delete', label: 'Delete', icon: <DeleteIcon /> }
   ];
   ```

## Testing

### Manual Testing Checklist

- [ ] Opens/closes on click
- [ ] Closes on outside click
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus management works
- [ ] Disabled state works
- [ ] Different placements work
- [ ] Responsive behavior

### Automated Testing

```tsx
// Example test
test('dropdown opens and closes correctly', () => {
  render(<Dropdown options={options} onSelect={jest.fn()} />);
  
  const trigger = screen.getByRole('button');
  fireEvent.click(trigger);
  
  expect(screen.getByRole('listbox')).toBeInTheDocument();
  
  fireEvent.click(document.body);
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
```

## Future Enhancements

Potential improvements for the dropdown system:

- **Search functionality** for large option lists
- **Multi-select support**
- **Virtual scrolling** for very large lists
- **Custom option rendering**
- **Animation customization**
- **Mobile-specific interactions** 