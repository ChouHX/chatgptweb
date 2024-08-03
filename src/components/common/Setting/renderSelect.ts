import type { SelectOption } from 'naive-ui'
import { NAvatar, NText } from 'naive-ui'
import { h } from 'vue'

export function RenderLabelAvatar(imgurl: string, option: SelectOption) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      h(NAvatar, {
        src: imgurl,
        round: true,
        size: 'small',
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0',
          },
        },
        [
          h('div', null, [option.label as string]),
          h(
            NText,
            { depth: 3, tag: 'div' },
          ),
        ],
      ),
    ],
  )
}
