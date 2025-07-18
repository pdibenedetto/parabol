import {SearchAndReplace} from '@sereneinserenade/tiptap-search-and-replace'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Details from '@tiptap/extension-details'
import DetailsContent from '@tiptap/extension-details-content'
import DetailsSummary from '@tiptap/extension-details-summary'
import Document from '@tiptap/extension-document'
import Focus from '@tiptap/extension-focus'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import TableRow from '@tiptap/extension-table-row'
import {TaskItem} from '@tiptap/extension-task-item'
import {TaskList} from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import {Editor, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import {Markdown} from 'tiptap-markdown'
import * as Y from 'yjs'
import type {useTipTapPageEditor_viewer$key} from '../__generated__/useTipTapPageEditor_viewer.graphql'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {themeBackgroundColors} from '../shared/themeBackgroundColors'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import ImageBlock from '../tiptap/extensions/imageBlock/ImageBlock'
import {ImageUpload} from '../tiptap/extensions/imageUpload/ImageUpload'
import {InsightsBlock} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {PageLinkBlock} from '../tiptap/extensions/pageLinkBlock/PageLinkBlock'
import {PageLinkPicker} from '../tiptap/extensions/pageLinkPicker/PageLinkPicker'
import {SlashCommand} from '../tiptap/extensions/slashCommand/SlashCommand'
import {Table} from '../tiptap/extensions/table/Table'
import {TableCell} from '../tiptap/extensions/table/TableCell'
import {TableHeader} from '../tiptap/extensions/table/TableHeader'
import {ElementWidth} from '../types/constEnums'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import useAtmosphere from './useAtmosphere'
import {usePageLinkPlaceholder} from './usePageLinkPlaceholder'
import {usePageProvider} from './usePageProvider'

const colorIdx = Math.floor(Math.random() * themeBackgroundColors.length)
export const useTipTapPageEditor = (
  pageId: string,
  options: {
    viewerRef: useTipTapPageEditor_viewer$key | null
    teamId?: string
  }
) => {
  const {viewerRef, teamId} = options
  const user = readInlineData(
    graphql`
      fragment useTipTapPageEditor_viewer on User @inline {
        preferredName
      }
    `,
    viewerRef
  )
  const preferredName = user?.preferredName
  const atmosphere = useAtmosphere()
  const placeholderRef = useRef<string | undefined>(undefined)
  const {provider} = usePageProvider(pageId)
  const editor = useEditor(
    {
      content: '',
      extensions: [
        Document.extend({
          content: 'heading block*'
        }),
        StarterKit.configure({
          document: false,
          history: false
        }),
        Details.configure({
          persist: true,
          HTMLAttributes: {
            class: 'details'
          }
        }),
        DetailsSummary,
        DetailsContent,
        Table.configure({
          allowTableNodeSelection: true
        }),
        TableRow,
        TableHeader,
        TableCell,
        Underline,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand.configure({}),
        Focus,
        ImageUpload.configure({
          editorWidth: ElementWidth.REFLECTION_CARD - 16 * 2,
          editorHeight: 88
        }),
        ImageBlock,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          includeChildren: true,
          placeholder: ({node, pos}) => {
            if (placeholderRef.current) {
              return placeholderRef.current
            }
            const {type, attrs} = node
            const {name} = type
            switch (name) {
              case 'heading':
                if (pos === 0) return 'New Page'
                return `Heading ${attrs.level}`
              case 'codeBlock':
                return 'New code'
              case 'blockquote':
                return 'New quote'
              case 'paragraph':
                return "Press '/' for commands"
              case 'detailsSummary':
                return 'New summary'
              case 'detailsContent':
                return 'Add details, use / to add blocks'
              case 'bulletList':
              case 'listItem':
              case 'orderedList':
              default:
                return ''
            }
          }
        }),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        SearchAndReplace.configure(),
        Collaboration.configure({
          document: provider?.document
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: preferredName,
            color: `#${themeBackgroundColors[colorIdx]}`
          }
        }),
        InsightsBlock,
        GlobalDragHandle,
        AutoJoiner,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true
        }),
        PageLinkPicker.configure({
          atmosphere
        }),
        PageLinkBlock.configure({yDoc: provider.document})
      ],
      autofocus: true,
      editable: true
    },
    [provider]
  )

  usePageLinkPlaceholder(editor!, placeholderRef)

  return {editor, provider}
}

export const makeEditorFromYDoc = (document: Y.Doc) => {
  return new Editor({
    extensions: [
      Document.extend({
        content: 'heading block*'
      }),
      StarterKit.configure({
        document: false,
        history: false
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Focus,
      ImageUpload,
      ImageBlock,
      LoomExtension,
      Mention.configure(mentionConfig),
      Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
      TiptapLinkExtension.configure({
        openOnClick: false
      }),
      Collaboration.configure({
        document
      }),
      InsightsBlock,
      PageLinkBlock.configure({yDoc: document})
    ]
  })
}
