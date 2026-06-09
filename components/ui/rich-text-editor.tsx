"use client"

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-3 border-b border-border/60 bg-muted/30 sticky top-0 z-10">
      {/* History */}
      <div className="flex items-center gap-1 bg-white dark:bg-black rounded-lg border border-border/50 p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Formatting */}
      <div className="flex items-center gap-1 bg-white dark:bg-black rounded-lg border border-border/50 p-1 shadow-sm">
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Toggle underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Toggle strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      {/* Typography */}
      <div className="flex items-center gap-1 bg-white dark:bg-black rounded-lg border border-border/50 p-1 shadow-sm">
        <Toggle
          size="sm"
          className="h-7 px-2 rounded-md font-bold text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 px-2 rounded-md font-bold text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Toggle>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 bg-white dark:bg-black rounded-lg border border-border/50 p-1 shadow-sm">
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          className="h-7 w-7 px-0 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      {/* Insert */}
      <div className="flex items-center gap-1 bg-white dark:bg-black rounded-lg border border-border/50 p-1 shadow-sm ml-auto">
        <Toggle
          size="sm"
          className="h-7 px-2 gap-1.5 rounded-md data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
          pressed={editor.isActive('link')}
          onPressedChange={toggleLink}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Link</span>
        </Toggle>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1.5 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground"
          onClick={(e) => { e.preventDefault(); addImage(); }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Image</span>
        </Button>
      </div>
    </div>
  )
}

export function RichTextEditor({ content, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 shadow-sm border border-border/50',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors',
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6 lg:p-10 font-body leading-loose prose-headings:font-serif prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="w-full bg-white dark:bg-black border border-border/60 rounded-xl overflow-hidden flex flex-col focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all shadow-sm">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[70vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
