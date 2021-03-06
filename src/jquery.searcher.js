(function IIFE() {

"use strict";

function factory($) {

	var pluginName = "searcher",
		dataKey = "plugin_" + pluginName,
		defaults = {
			// selector for the item element
			itemSelector: "tbody > tr",
			// selector for the text elements
			textSelector: "td",
			// selector for the input
			inputSelector: "",
			// determines whether the search is case sensitive or not
			caseSensitive: false,
			// function to toggle the visibility of the item
			toggle: function(item, containsText) {
				$(item).toggle(containsText);
			},
			// a html string used to highlight the search term in the text
			// e.g: "<span class='highlight'>$1</span>"
			// $1 will be replaced with the search term
			highlight: ""
		};

	function Searcher(element, options)
	{
		this.element = element;

		this.options = $.extend({ }, defaults, options);

		this._create();
	}

	Searcher.prototype = {
		_create: function()
		{
			this._$element = $(this.element);

			// find the input and listen to various events
			var fn = $.proxy(this._onValueChange, this);
			this._$input = $(this.options.inputSelector).bind("input change keyup", fn);

			// remember the last entered value
			this._lastValue = "";
		},
		_onValueChange: function()
		{
			var options = this.options,
				textSelector = options.textSelector,
				toggle = options.toggle,
				highlight = options.highlight;

			// build the regex for searching
			var flags = "gm" + (!options.caseSensitive ? "i" : "");
			var value = new RegExp("(" + escapeRegExp(this._$input.val()) + ")", flags);

			if (value.toString() === this._lastValue)
				return; // nothing has changed

			this._lastValue = value.toString();

			this._$element
				.find(options.itemSelector)
				.each(function eachItem() {
					var $item = $(this),
						$textElements = textSelector ? $item.find(textSelector) : $item,
						itemContainsText = false;

					$textElements = $textElements.each(function eachTextElements() {
						var $text = $(this),
							text = $text.text(),
							containsText = value.test(text);

						itemContainsText = itemContainsText || containsText;

						var data = $text.data("original");
						if (containsText && highlight)
						{
							if (!data)
								$text.data("original", $text.html());
							$text.html(text.replace(value, highlight));
						}
						else if (!containsText && data)
						{
							$text.html(data);
							$text.removeData("original");
						}
					});

					toggle(this, itemContainsText);
				});
		}
	};

	function escapeRegExp(text)
	{
		// see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
		return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}

	$.fn[pluginName] = function pluginHandler(options) {
		return this.each(function() {
			var searcher = $.data(this, dataKey);
			// either create a new searcher
			if (!searcher)
				$.data(this, dataKey, new Searcher(this, options));
			// or update the options
			else
				$.extend(searcher.options, options);
		});
	};

}

// AMD style (register as an anonymous module)
if (typeof(define) === "function" && define.amd)
	define(["jquery"], factory);
// node/CommonJS style (for Browserify)
else if (typeof(exports) === "object")
	module.exports = factory;
// browser
else
	factory(jQuery);

}).call(this);