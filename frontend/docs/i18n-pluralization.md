# I18n Pluralization Documentation

This document explains how to use pluralization in the Quizlet application using the svelte-i18n library.

## Basic Usage

Pluralization is implemented using the ICU Message Format standard. This allows handling different plural forms based on the numeric value.

### Basic example:

```svelte
<script>
	import { _ } from '$lib/i18n';

	let count = 5;
</script>

<p>{$_('common.count', { values: { count } })}</p>
```

This will output "5 items" in English or "5 アイテム" in Japanese.

## Available Pluralization Patterns

The following pluralization patterns are available in the locale files:

### Common patterns:

- `common.count`: General purpose item count
- `common.option`: Option pluralization
- `common.point`: Point pluralization
- `common.question`: Question pluralization

### Quiz-specific patterns:

- `quiz.questionCount`: Question count
- `quiz.correctCount`: Correct answer count
- `quiz.incorrectCount`: Incorrect option count
- `quiz.missedCount`: Missed correct options
- `quiz.selectedCount`: Selected incorrect options

### Edit-specific patterns:

- `edit.answerCount`: Answer count
- `edit.answerOptionPlaceholder`: Answer option placeholder

## ICU Format Syntax

The ICU Message Format for pluralization has the following syntax:

```
{count, plural, =0 {no items} =1 {1 item} other {# items}}
```

Where:

- `count` is the variable name
- `plural` indicates this is a pluralization rule
- `=0`, `=1`, etc. are exact matches for specific numbers
- `other` is the default case for all other numbers
- `#` is replaced with the actual number

### English example:

```
{count, plural, =0 {no items} =1 {1 item} other {# items}}
```

### Japanese example (Japanese doesn't have distinct plurals):

```
{count, plural, =0 {アイテムなし} other {# アイテム}}
```

## Adding New Pluralization Rules

1. Add the pattern to the locale files (en.json and ja.json)
2. Use the pattern in your Svelte components

Example:

```svelte
{$_('quiz.correctCount', { values: { count: correctCount } })}
```

## Testing

You can test pluralization by visiting the `/i18n-test` route, which demonstrates various plural forms in both English and Japanese.
