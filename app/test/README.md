# Test & Demo Pages

This directory contains all test and demo pages for the Xpeak AI application.

## Structure

- `/test` - Main test dashboard (this page)
- `/test/optimistic` - Optimistic UI test page
- `/test/shadcn` - shadcn/ui integration test
- `/test/supabase` - Supabase client test
- `/test/word-maze` - Word Maze functionality test
- `/test/sagea-animation` - Sagea animation demo

## Usage

1. **Development**: Use these pages to test specific features during development
2. **Demo**: Show these pages to stakeholders or for demos
3. **Debugging**: Isolate and debug specific functionality
4. **Testing**: Manual testing of UI components and interactions

## Access

- **Local Development**: Visit `http://localhost:3003/test`
- **Production**: These pages should be restricted or removed in production builds

## Adding New Test Pages

1. Create a new directory under `/test/`
2. Add a `page.tsx` file in the new directory
3. Update the `testPages` array in `/test/page.tsx`
4. Add any necessary links in the footer or header

## Best Practices

- Keep test pages focused on specific functionality
- Include clear descriptions of what each page tests
- Use consistent styling and layout
- Add navigation back to the main test dashboard
- Consider adding environment checks (e.g., only show in development) 