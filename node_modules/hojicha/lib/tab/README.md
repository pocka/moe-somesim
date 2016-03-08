# Hojicha - Tab

Simple tab component

+ [ ] React
+ [x] Deku

## Markup

```jsx
<Tab name="test">
	<TabItem name="foo" group="test" title="Foo" default>
		<p>Foo!</p>
	</TabItem>
	<TabItem name="bar" group="test" title="Bar">
		<p>B</p>
		<p>a</p>
		<p>r</p>
		<p>!</p>
	</TabItem>
</Tab>
```

```html
<div id="hojicha--tab--container--test" class="hojicha--tab-container">
	<div class="hojicha--tab--item">
		<input name="test" type="radio" checked class="hojicha--tab--item--radio" id="hojicha--tab--item--radio--foo" />
		<label class="hojicha--tab--item--label" for="hojicha--tab--item--radio--foo">
			Foo
		</label>
		<div class="hojicha--tab--item--panel">
			<div class="hojicha--tab--item--contents">
				<p>Foo!</p>
			</div>
		</div>
	</div>
	<div class="hojicha--tab--item">
		<input name="test" type="radio" class="hojicha--tab--item--radio" id="hojicha--tab--item--radio--bar" />
		<label class="hojicha--tab--item--label" for="hojicha--tab--item--radio--bar">
			Bar
		</label>
		<div class="hojicha--tab--item--panel">
			<div class="hojicha--tab--item--contents">
				<p>B</p>
				<p>a</p>
				<p>r</p>
				<p>!</p>
			</div>
		</div>
	</div>
</div>
```

## CSS

Great logic from here: [http://codepen.io/Merri/full/bytea/](http://codepen.io/Merri/full/bytea/)
