# Lorebook and Character Book Enhancements

This document describes the comprehensive enhancements made to the Lorebook and Character management system in Inkwell.

## Overview

The lorebook and character book systems have been significantly enhanced with:
- **Image support** for visual references
- **Extended metadata fields** for richer character and lore details
- **Enhanced preview functionality** in the editor
- **Better organization tools** with tags, colors, and categories
- **Improved UI/UX** with tabbed interfaces and gallery uploads

---

## Character Enhancements

### New Character Fields

#### Visual & Media
- **`avatar`** (string): Character portrait/avatar image (URL or base64)
- **`images`** (JSON array): Gallery of additional character images, concept art, references

#### Enhanced Details
- **`aliases`** (JSON array): Alternate names, nicknames, titles
- **`occupation`** (string): Character's current profession or role in society
- **`appearance`** (string): Detailed physical appearance beyond basic description
- **`voice`** (string): Voice description, speech patterns, accent, catchphrases
- **`equipment`** (string): Items, weapons, or equipment they carry
- **`abilities`** (string): Special abilities, powers, or skills
- **`fears`** (string): Fears, phobias, and weaknesses
- **`secrets`** (string): Hidden information, plot-relevant secrets
- **`notes`** (string): Additional notes and miscellaneous information

#### Organization
- **`tags`** (JSON array): Custom tags for filtering and organization
- **`color`** (string): Color code for visual identification (hex format)
- **`isMainCharacter`** (boolean): Flag to mark primary characters

### Character Creation Dialog

The enhanced character creation dialog features a **6-tab interface**:

1. **Basic** - Name, age, role, occupation, physical descriptions
2. **Visual** - Avatar upload, image gallery (up to 8 images)
3. **Personality** - Traits, voice, background, fears
4. **Story** - Goals, relationships, secrets
5. **Abilities** - Special abilities, equipment, skills
6. **Organize** - Main character flag, color tag, aliases, tags

### Using the Enhanced Character Form

```typescript
import { CreateCharacterDialogEnhanced } from '@/components/characters/create-character-dialog-enhanced'

<CreateCharacterDialogEnhanced
  open={isOpen}
  onOpenChange={setIsOpen}
  projectId={projectId}
  onCharacterCreated={handleCharacterCreated}
/>
```

---

## Lorebook Enhancements

### New Lorebook Fields

#### Visual & Media
- **`thumbnail`** (string): Entry thumbnail image (URL or base64)
- **`images`** (JSON array): Related images, maps, diagrams

#### Enhanced Details
- **`subcategory`** (string): More specific categorization within main category
- **`relatedEntries`** (JSON array): IDs of related lorebook entries
- **`tags`** (JSON array): Custom tags for advanced filtering
- **`aliases`** (JSON array): Alternate names or keywords for this entry
- **`color`** (string): Color code for visual organization

#### Additional Context
- **`summary`** (string): Brief summary for quick reference
- **`spoilerLevel`** (integer 0-3): Spoiler severity indicator
  - 0 = No spoiler
  - 1-3 = Increasing spoiler severity
- **`timeframe`** (string): When this lore is relevant (e.g., "Ancient Era", "Current Timeline")
- **`isCanon`** (boolean): Mark non-canon or alternate universe entries
- **`isArchived`** (boolean): Archive old or unused entries (hidden by default)

### Database Schema

```prisma
model LorebookEntry {
  // ... existing fields ...

  // Visual & Media
  thumbnail        String?
  images           String?  // JSON array

  // Enhanced Details
  subcategory      String?
  relatedEntries   String?  // JSON array
  tags             String?  // JSON array
  aliases          String?  // JSON array
  color            String?

  // Additional Context
  summary          String?
  spoilerLevel     Int      @default(0)
  timeframe        String?
  isCanon          Boolean  @default(true)
  isArchived       Boolean  @default(false)

  @@index([projectId, isArchived])
}
```

---

## Image Upload Components

### ImageUpload

Single image upload with drag-and-drop support:

```typescript
import { ImageUpload } from '@/components/ui/image-upload'

<ImageUpload
  value={imageValue}
  onChange={setImageValue}
  placeholder="Upload character portrait"
  aspectRatio="portrait" // "square" | "portrait" | "landscape" | "wide"
  maxSize={5} // Max file size in MB
/>
```

### ImageGalleryUpload

Multiple image upload with gallery view:

```typescript
import { ImageGalleryUpload } from '@/components/ui/image-upload'

<ImageGalleryUpload
  values={images}
  onChange={setImages}
  maxImages={10}
  maxSize={5}
/>
```

**Features:**
- Drag and drop support
- Image preview with hover actions
- Base64 encoding for easy storage
- Size validation
- Aspect ratio control
- Responsive grid layout

---

## Enhanced Preview Panel

The new `EnhancedPreviewPanel` component provides rich, contextual previews in the editor:

### Features

- **Automatic Detection**: Detects mentioned characters and lorebook entries in scene content
- **Visual Previews**: Displays avatars, thumbnails, and image galleries
- **Tabbed Details**: Organized information across multiple tabs
- **Color Coding**: Visual organization with custom colors
- **Badge System**: Shows main characters, spoiler levels, canon status
- **Expandable Sections**: Collapsible character and lorebook sections

### Usage

```typescript
import { EnhancedPreviewPanel } from '@/components/editor/enhanced-preview-panel'

<EnhancedPreviewPanel
  characters={characters}
  lorebookEntries={lorebookEntries}
  sceneContent={sceneContent}
/>
```

### Character Preview

When clicking a character in the preview panel:
- **Full-size avatar** with color-coded border
- **Aliases and tags** for quick reference
- **4 detail tabs**:
  - Description (physical details, appearance)
  - Personality (traits, voice, background)
  - Story (goals, relationships, secrets)
  - Details (abilities, equipment, notes, image gallery)
- **Main character badge** for primary characters

### Lorebook Preview

When clicking a lorebook entry:
- **Thumbnail image** if available
- **Summary box** for quick reference
- **Category and subcategory badges**
- **Spoiler level warnings**
- **Timeframe context**
- **Canon/non-canon indicators**
- **Related images gallery**
- **Usage statistics**

---

## API Updates

### Character API

**POST /api/characters**
- Accepts all new character fields
- Validates required fields (name, projectId)
- Stores images as base64 strings
- Stores arrays (aliases, tags, images) as JSON strings

**PATCH /api/characters/[id]**
- Updates any character field
- Maintains ownership verification

### Lorebook API

**POST /api/lorebook**
- Accepts all new lorebook fields
- Default values: `spoilerLevel=0`, `isCanon=true`, `isArchived=false`
- Stores images and arrays as JSON strings

**GET /api/lorebook**
- Filters out archived entries by default
- Supports category filtering
- Sortable by: createdAt, priority, useCount, lastUsed

---

## Database Migration

A migration has been created to add all new fields to existing database schemas:

```bash
npx prisma migrate dev
```

Migration file: `20251122122814_enhance_lorebook_character_schema`

### Migration Details

**Character Table:**
- Added 16 new optional fields
- All new fields are nullable
- Backward compatible with existing data

**LorebookEntry Table:**
- Added 13 new optional fields
- New indexes for performance
- Default values set for boolean and integer fields

---

## Best Practices

### Image Storage

1. **Base64 Encoding**: Images are stored as base64 strings for simplicity
2. **Size Limits**: Default max size is 5MB per image
3. **Optimization**: Consider optimizing large images before upload
4. **Alternative**: For production, consider using cloud storage (S3, Cloudinary) and storing URLs

### JSON Fields

Arrays are stored as JSON strings:

```typescript
// Storing
const aliases = ['The Dark Knight', 'Batman', 'Bruce']
character.aliases = JSON.stringify(aliases)

// Reading
const aliases = character.aliases ? JSON.parse(character.aliases) : []
```

### Color Codes

Use hex format for colors:
```typescript
color: "#3B82F6" // Blue
color: "#EF4444" // Red
color: "#10B981" // Green
```

### Organization

1. **Use tags** for flexible categorization
2. **Set colors** for quick visual identification
3. **Mark main characters** to highlight important characters
4. **Use spoiler levels** to protect plot-sensitive information
5. **Archive old entries** instead of deleting them

---

## Examples

### Creating a Character with Images

```typescript
const characterData = {
  projectId: "project-id",
  name: "Elena Blackwood",
  age: "28",
  role: "Protagonist",
  occupation: "Royal Investigator",
  avatar: "data:image/png;base64,...", // Avatar image
  images: JSON.stringify([
    "data:image/png;base64,...", // Concept art 1
    "data:image/png;base64,...", // Concept art 2
  ]),
  aliases: JSON.stringify(["The Shadow Hunter", "Lady Elena"]),
  tags: JSON.stringify(["magic-user", "detective", "noble"]),
  color: "#9333EA",
  isMainCharacter: true,
  description: "Tall with striking violet eyes...",
  abilities: "Shadow magic, enhanced perception...",
  secrets: "Secretly half-demon, working to redeem her bloodline",
}
```

### Creating a Lorebook Entry with Images

```typescript
const lorebookData = {
  projectId: "project-id",
  key: "Void Gate",
  value: "An ancient portal connecting realms...",
  summary: "Mystical gateway between dimensions",
  category: "Locations",
  subcategory: "Magical Sites",
  thumbnail: "data:image/png;base64,...",
  images: JSON.stringify([
    "data:image/png;base64,...", // Map
    "data:image/png;base64,...", // Diagram
  ]),
  aliases: JSON.stringify(["The Gateway", "Portal of Shadows"]),
  tags: JSON.stringify(["magic", "transportation", "ancient"]),
  timeframe: "Ancient Era - Still Active",
  spoilerLevel: 2,
  priority: 8,
  isCanon: true,
}
```

---

## Future Enhancements

Potential improvements for future versions:

1. **Cloud Storage Integration**: S3/Cloudinary for image hosting
2. **Image Editing**: Built-in crop/resize tools
3. **Relationship Graphs**: Visual character relationship diagrams
4. **Timeline View**: Temporal organization of lorebook entries
5. **Import/Export**: JSON export for character/lorebook data
6. **Templates**: Pre-built character archetypes and lore templates
7. **AI Generation**: AI-assisted character portraits and descriptions

---

## Troubleshooting

### Images Not Displaying

- Check file size (must be under 5MB by default)
- Verify base64 encoding is correct
- Ensure proper image format (JPEG, PNG, GIF, WebP)

### JSON Parse Errors

- Always wrap JSON.parse in try-catch
- Check for null/undefined before parsing
- Provide fallback arrays: `JSON.parse(field) || []`

### Migration Issues

If migration fails:
```bash
# Reset database (development only!)
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

---

## Summary

These enhancements transform the lorebook and character systems into comprehensive world-building tools with:

- **Visual richness** through image support
- **Detailed characterization** with 16+ new character fields
- **Advanced organization** with tags, colors, and categories
- **Better context awareness** with enhanced preview panels
- **Flexible metadata** for complex storytelling needs

The new features maintain backward compatibility while providing powerful new capabilities for authors building rich, detailed story worlds.
