<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Switch } from '$lib/components/ui/switch';
	import { fn } from 'storybook/test';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Example/Switch',
		component: Switch,
		tags: ['autodocs'],
		argTypes: {
			checked: { control: 'boolean' },
			disabled: { control: 'boolean' },
			class: { control: 'text' },
			label: { control: 'text' },
			onClick: {
				action: 'clicked',
				description: 'Function to call when the switch is clicked'
			},
			onKeydown: {
				action: 'keydown',
				description: 'Function to call when a key is pressed while the switch is focused'
			}
		},
		args: {
			checked: false,
			disabled: false,
			label: 'Switch',
			class: undefined,
			onClick: fn(window.alert('Switch clicked')),
			onKeydown: fn()
		}
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{ label: 'Toggle me', checked: false, onClick: fn() }} />
<Story name="Checked" args={{ label: 'Checked', checked: true, onClick: fn() }} />
<Story name="With Custom Label" args={{ label: 'Custom Label', checked: false, onClick: fn() }} />
